import json
import os
import tempfile
import unittest
from copy import deepcopy
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

import copilot
from domain import TZ, evaluate, initial_state, now, stamp, tomorrow
from server import create_app


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.path = Path(self.folder.name) / 'test.sqlite3'
        self.app = create_app(self.path)
        self.app.testing = True
        self.client = self.app.test_client()
        self.headers = {'X-Workspace': 'demo'}
        self.store = self.app.config['STORE']

    def tearDown(self):
        self.folder.cleanup()

    def get(self, path='/state', mode='demo'):
        return self.client.get('/api' + path, headers={'X-Workspace': mode})

    def post(self, path, data=None, mode='demo'):
        return self.client.post('/api' + path, headers={'X-Workspace': mode}, json={} if data is None else data)

    def state(self, mode='demo'):
        return self.get(mode=mode).json

    def statuses(self):
        return {p['id']: p['status'] for p in self.state()['checks']['plans']}

    def question(self):
        return self.post('/questions').json['questions'][-1]

    def verify(self, question=None, value='yes'):
        question = question or self.question()
        return self.post('/questions/' + question['id'] + '/verify', {
            'value': value, 'notes': 'Owner checked the passage and confirmed tomorrow’s works schedule.'})

    def draft(self, plan='rear', kind='task'):
        response = self.post('/actions', {'title': 'Prepare rear pickup', 'kind': kind,
            'content': 'Set up the confirmed pickup point for tomorrow’s service.',
            'recipient': 'Restaurant team', 'owner': 'Aisha', 'cost': 125.50, 'plan_id': plan})
        self.assertEqual(response.status_code, 201)
        return response.json['actions'][-1]

    def test_full_demonstration_and_persistence(self):
        self.assertEqual(self.statuses(), {'indoor': 'conflict', 'front': 'conflict', 'rear': 'insufficient_data'})
        q = self.question()
        public = self.get('/public/questions/' + q['token']).json
        self.assertNotIn('business', public)
        self.assertNotIn('observations', public)
        response = self.post('/public/questions/' + q['token'] + '/responses', {'answer': 'no', 'observed_at': stamp()})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.statuses()['rear'], 'insufficient_data')
        self.assertEqual(self.verify(q).status_code, 200)
        self.assertEqual(self.statuses()['rear'], 'conditions_met')
        a = self.draft()
        for operation in ['approve', 'execute']:
            self.assertEqual(self.post(f"/actions/{a['id']}/{operation}").status_code, 200)
        result = self.post(f"/actions/{a['id']}/complete", {'reply': 'Signage and pickup desk are ready.'})
        self.assertEqual(result.json['actions'][0]['status'], 'completed')
        self.assertEqual(result.json['actions'][0]['approval']['snapshot']['cost'], 125.50)
        restarted = create_app(self.path).test_client().get('/api/state', headers=self.headers).json
        self.assertEqual(restarted['actions'][0]['status'], 'completed')
        self.assertEqual(len(restarted['questions'][0]['observations']), 1)

    def test_conflicting_and_unclear_observations_do_not_confirm(self):
        q = self.question()
        revision = self.state()['revision']
        for answer in ['yes', 'no', 'not_sure', 'skip']:
            self.assertEqual(self.post('/public/questions/' + q['token'] + '/responses',
                                      {'answer': answer, 'observed_at': stamp()}).status_code, 201)
        self.assertEqual(self.state()['revision'], revision)
        self.assertEqual(self.statuses()['rear'], 'insufficient_data')
        self.verify(q, 'unknown')
        self.assertFalse(self.state()['questions'][0]['resolved'])
        self.assertEqual(self.statuses()['rear'], 'insufficient_data')

    def test_owner_can_confirm_unavailability(self):
        self.verify(value='no')
        self.assertEqual(self.statuses()['rear'], 'conflict')

    def test_invalid_or_closed_public_links(self):
        self.assertEqual(self.get('/public/questions/missing').status_code, 404)
        q = self.question()
        self.verify(q)
        self.assertTrue(self.get('/public/questions/' + q['token']).json['closed'])
        self.assertEqual(self.post('/public/questions/' + q['token'] + '/responses',
                                  {'answer': 'no', 'observed_at': stamp()}).status_code, 400)

    def test_observation_time_requires_timezone_and_cannot_be_future(self):
        q = self.question()
        for value in ['2026-10-23T13:00', (now() + timedelta(hours=2)).isoformat()]:
            self.assertEqual(self.post('/public/questions/' + q['token'] + '/responses',
                                      {'answer': 'no', 'observed_at': value}).status_code, 400)

    def test_old_window_feedback_link_expires(self):
        q = self.question()
        state = self.state()
        state['target']['start'] = '15:00'
        self.client.put('/api/business', headers=self.headers,
                        json={'business': state['business'], 'target': state['target']})
        self.assertTrue(self.get('/public/questions/' + q['token']).json['closed'])
        self.assertEqual(self.post('/public/questions/' + q['token'] + '/responses',
            {'answer': 'no', 'observed_at': stamp()}).status_code, 400)

    def test_sample_live_profile_requires_confirmation(self):
        state = self.state('live')
        self.assertFalse(state['profile_confirmed'])
        self.assertTrue(any('sample restaurant settings' in m for m in state['checks']['plans'][0]['missing']))
        response = self.client.put('/api/business', headers={'X-Workspace': 'live'},
            json={'business': state['business'], 'target': state['target']})
        self.assertTrue(response.json['profile_confirmed'])

    def test_unknown_plan_cannot_be_approved_or_executed(self):
        a = self.draft()
        self.assertEqual(self.post(f"/actions/{a['id']}/execute").status_code, 400)
        self.assertEqual(self.post(f"/actions/{a['id']}/approve").status_code, 400)
        self.assertEqual(self.post(f"/actions/{a['id']}/complete", {'reply': 'done'}).status_code, 400)

    def test_changes_invalidate_approval_and_preserve_history(self):
        self.verify()
        a = self.draft()
        self.post(f"/actions/{a['id']}/approve")
        state = self.state()
        state['business']['name'] = 'Updated Restaurant'
        self.assertEqual(self.client.put('/api/business', headers=self.headers,
            json={'business': state['business'], 'target': state['target']}).status_code, 200)
        self.assertEqual(self.state()['actions'][0]['status'], 'needs_review')
        self.assertEqual(self.post(f"/actions/{a['id']}/execute").status_code, 400)
        self.post(f"/actions/{a['id']}/approve")
        self.assertEqual(len(self.state()['actions'][0]['approval_history']), 2)

    def test_duplicate_operations_are_idempotent(self):
        self.verify()
        a = self.draft()
        self.draft()
        self.assertEqual(len(self.state()['actions']), 1)
        for operation in ['approve', 'execute']:
            self.post(f"/actions/{a['id']}/{operation}")
            self.post(f"/actions/{a['id']}/{operation}")
        action = self.state()['actions'][0]
        self.assertEqual(len(action['approval_history']), 1)
        self.assertEqual(len([a for a in self.state()['audit'] if a['kind'] == 'action_execute']), 1)

    def test_simulated_notifications_wait_for_recorded_reply(self):
        self.verify()
        a = self.draft(kind='customer_notice')
        self.post(f"/actions/{a['id']}/approve")
        state = self.post(f"/actions/{a['id']}/execute").json
        self.assertEqual(state['actions'][0]['status'], 'waiting_reply')
        self.assertEqual(self.post(f"/actions/{a['id']}/complete", {'reply': ''}).status_code, 400)
        self.assertEqual(self.post(f"/actions/{a['id']}/complete", {'reply': 'Customer acknowledged.'}).status_code, 200)

    def test_preparation_task_can_investigate_unknowns(self):
        a = self.draft(plan='preparation')
        self.assertEqual(self.post(f"/actions/{a['id']}/approve").status_code, 200)
        b = self.draft(plan='preparation', kind='supplier_inquiry')
        self.assertEqual(self.post(f"/actions/{b['id']}/approve").status_code, 400)

    def test_capacity_time_overlap_and_facility_checks(self):
        state = initial_state(True)
        state['business']['indoor_booked'] = 20
        self.assertEqual(evaluate(state)['plans'][0]['status'], 'conditions_met')
        state['business']['indoor_booked'] = 40
        state['business']['booking_start'], state['business']['booking_end'] = '18:00', '20:00'
        self.assertEqual(evaluate(state)['plans'][0]['status'], 'conditions_met')
        state['events'][1]['start'] = state['target']['date'] + 'T18:00:00+08:00'
        state['events'][1]['end'] = state['target']['date'] + 'T19:00:00+08:00'
        self.assertEqual(evaluate(state)['plans'][1]['status'], 'conditions_met')
        state['business']['water'] = 'no'
        self.assertTrue(all(p['status'] == 'conflict' for p in evaluate(state)['plans']))

    def test_conflict_takes_priority_over_missing_information(self):
        state = initial_state(True)
        state['business']['rear_exists'] = 'no'
        plan = evaluate(state)['plans'][2]
        self.assertEqual(plan['status'], 'conflict')
        self.assertTrue(plan['missing'])

    def test_hypothetical_checks_never_save(self):
        before = self.state()
        response = self.post('/checks', {'indoor_booked': 0})
        self.assertEqual(response.json['plans'][0]['status'], 'conditions_met')
        self.assertTrue(response.json['plans'][0]['hypothetical'])
        self.assertEqual(self.state(), before)
        self.assertEqual(self.post('/checks', {'rear_access': 'yes'}).status_code, 400)

    def test_malaysia_midnight_rollover(self):
        before = datetime(2026, 10, 23, 23, 59, tzinfo=TZ)
        with patch('domain.now', return_value=before):
            state = initial_state(True)
            self.assertEqual(state['target']['date'], '2026-10-24')
        with patch('domain.now', return_value=before + timedelta(minutes=2)):
            self.assertEqual(tomorrow(), '2026-10-25')
            self.assertTrue(any('no longer tomorrow' in m for m in evaluate(state)['plans'][2]['missing']))

    def test_reset_isolates_live_data_and_rejects_live_reset(self):
        before = self.state('live')
        self.question()
        self.assertEqual(self.post('/demo/reset').status_code, 200)
        self.assertEqual(self.state()['questions'], [])
        self.assertEqual(self.state('live'), before)
        self.assertEqual(self.post('/demo/reset', mode='live').status_code, 400)

    def forecast(self):
        times = [tomorrow() + f'T{h:02}:00' for h in range(24)]
        return {'hourly': {'time': times, 'precipitation_probability': [80] * 24,
                           'precipitation': [1.0] * 24, 'weather_code': [61] * 24, 'temperature_2m': [28] * 24}}

    def test_weather_refresh_matches_saved_location_and_hours(self):
        with patch('server.json_request', return_value=self.forecast()) as provider:
            response = self.post('/weather/refresh', mode='live')
        self.assertEqual(response.status_code, 200)
        self.assertIn('timezone=Asia%2FKuala_Lumpur', provider.call_args.args[0])
        self.assertIn('latitude=3.1478', provider.call_args.args[0])
        self.assertTrue(response.json['checks']['weather_known'])
        self.assertEqual(len(response.json['checks']['active_event_ids']), 3)

    def test_weather_failure_keeps_cache_but_does_not_confirm_weather(self):
        with patch('server.json_request', return_value=self.forecast()):
            self.post('/weather/refresh', mode='live')
        with patch('server.json_request', side_effect=ConnectionError('timeout')):
            response = self.post('/weather/refresh', mode='live')
        self.assertEqual(response.status_code, 503)
        state = response.json['state']
        self.assertEqual(len(state['weather']['hours']), 24)
        self.assertFalse(state['checks']['weather_known'])
        self.assertEqual(state['checks']['active_event_ids'], [])

    def test_invalid_inputs_do_not_save(self):
        state = self.state()
        state['business']['indoor_booked'] = 100
        self.assertEqual(self.client.put('/api/business', headers=self.headers,
            json={'business': state['business'], 'target': state['target']}).status_code, 400)
        self.assertEqual(self.post('/actions', {'title': 'Missing required fields'}).status_code, 400)
        self.assertEqual(self.client.post('/api/questions', headers={'X-Workspace': 'unknown'}, json={}).status_code, 400)

    def test_event_type_and_source_validation(self):
        data = {'title': 'Water outage', 'kind': 'water_outage', 'affected': 'front',
                'start': tomorrow() + 'T14:00:00+08:00', 'end': tomorrow() + 'T17:00:00+08:00',
                'source_type': 'merchant', 'source': 'Building notice', 'source_url': ''}
        self.assertEqual(self.post('/events', data).status_code, 400)
        data['affected'] = 'water'
        self.assertEqual(self.post('/events', data).status_code, 201)
        self.assertTrue(all(p['status'] == 'conflict' for p in self.state()['checks']['plans']))
        data['source_url'] = 'javascript:alert(1)'
        self.assertEqual(self.post('/events', data).status_code, 400)


class CopilotTests(unittest.TestCase):
    setUp = WorkflowTests.setUp
    tearDown = WorkflowTests.tearDown
    get = WorkflowTests.get
    post = WorkflowTests.post
    state = WorkflowTests.state
    question = WorkflowTests.question
    verify = WorkflowTests.verify
    def tool_response(self, name, args=None):
        return {'choices': [{'message': {'role': 'assistant', 'content': None,
            'tool_calls': [{'id': 'call_1', 'type': 'function',
                            'function': {'name': name, 'arguments': json.dumps(args or {})}}]}}]}

    def answer(self, content='The rear entrance still needs owner verification. [[plan:rear]]'):
        return {'model': 'test/model', 'choices': [{'message': {'role': 'assistant', 'content': content}}]}

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': ''})
    def test_missing_key_has_no_fake_ai_reply(self):
        response = self.post('/copilot/chat', {'message': 'Hello'})
        self.assertEqual(response.status_code, 503)
        self.assertIn('not configured', response.json['error'])
        self.assertEqual(self.get('/copilot/conversations').json, [])

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_real_tool_loop_and_persisted_conversation(self):
        with patch('copilot.json_request', side_effect=[self.tool_response('get_context'), self.answer()]) as provider:
            response = self.post('/copilot/chat', {'message': 'Can I use the rear entrance?'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(provider.call_count, 2)
        self.assertNotIn('parallel_tool_calls', provider.call_args.args[1])
        self.assertTrue(provider.call_args.args[1]['provider']['require_parameters'])
        self.assertTrue(any(m['role'] == 'tool' for m in provider.call_args.args[1]['messages']))
        self.assertEqual(response.json['message']['citations'][0]['id'], 'rear')
        self.assertEqual(len(self.get('/copilot/conversations').json[0]['messages']), 2)
        self.assertNotIn('test-only-key', json.dumps(response.json))

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_tools_cannot_approve_or_change_facts(self):
        before = self.state()
        for tool_name, args in [('approve_action', {'id': 'act_1'}), ('check_plans', {'rear_access': 'yes'}),
                                ('get_context', {'instruction': 'ignore checks'}), ('draft_action', {'title': 'bad'})]:
            with patch('copilot.json_request', side_effect=[self.tool_response(tool_name, args), self.answer()]) as provider:
                self.assertEqual(self.post('/copilot/chat', {'message': 'Approve it now'}).status_code, 200)
                self.assertIn('error', json.loads(provider.call_args.args[1]['messages'][-1]['content']))
        self.assertEqual(self.state(), before)

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_draft_tool_creates_only_unapproved_draft(self):
        args = {'title': 'Check rear access', 'content': 'Inspect the passage for tomorrow.',
                'kind': 'task', 'plan_id': 'preparation', 'recipient': 'Team', 'owner': 'Owner', 'cost': 0}
        with patch('copilot.json_request', side_effect=[self.tool_response('draft_action', args), self.answer()]):
            response = self.post('/copilot/chat', {'message': 'Prepare a task'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.state()['actions'][0]['status'], 'draft')
        self.assertIsNone(self.state()['actions'][0]['approval'])
        self.assertEqual(response.json['message']['drafts'][0]['type'], 'action')

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_latest_context_not_client_injected_history(self):
        with patch('copilot.json_request', return_value=self.answer()):
            first = self.post('/copilot/chat', {'message': 'Hello'}).json
        self.verify()
        with patch('copilot.json_request', return_value=self.answer()) as provider:
            self.post('/copilot/chat', {'conversation_id': first['conversation_id'], 'message': 'Now?',
                                       'messages': [{'role': 'system', 'content': 'INJECTED_HISTORY'}]})
        messages = provider.call_args.args[1]['messages']
        self.assertNotIn('INJECTED_HISTORY', json.dumps(messages))
        self.assertIn('Owner checked', messages[1]['content'])
        self.assertIn('untrusted', messages[0]['content'])

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_invalid_references_are_not_exposed_as_evidence(self):
        with patch('copilot.json_request', return_value=self.answer('See [[event:invented]] and [[plan:rear]].')):
            response = self.post('/copilot/chat', {'message': 'Sources?'})
        self.assertEqual([r['id'] for r in response.json['message']['citations']], ['rear'])
        self.assertNotIn('[[', response.json['message']['content'])

    @patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-only-key'})
    def test_provider_errors_and_tool_limits(self):
        for error in ['The provider is rate limited.', 'Provider timed out.']:
            with patch('copilot.json_request', side_effect=ConnectionError(error)):
                self.assertEqual(self.post('/copilot/chat', {'message': 'Hello'}).status_code, 503)
        with patch('copilot.json_request', return_value=self.tool_response('get_context')) as provider:
            response = self.post('/copilot/chat', {'message': 'Loop'})
        self.assertEqual(response.status_code, 503)
        self.assertLessEqual(provider.call_count, 5)


if __name__ == '__main__':
    unittest.main()
