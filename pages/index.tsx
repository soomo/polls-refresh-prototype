import { css } from '@emotion/core';
import dynamic from 'next/dynamic';

import themes, { ThemeProvider } from '@soomo/lib/styles/themes';

import TopBar from '../components/TopBar';
import { NextPage } from 'next';
import { useCallback, useState } from 'react';

const Text = dynamic(() => import('@soomo/lib/components/pageElements').then((m) => m.Text), {
	ssr: false
});

/*
const SQRQuestionDeck = dynamic(
	() => import('../components/SQRQuestionDeck').then((m) => m.default),
	{ ssr: false }
);
*/

const PollQuestion = dynamic(() => import('../components/PollQuestion').then((m) => m.default), {
	ssr: false
});

const POLL_BODY =
	'In your opinion, which of the three issues that specifically mention Child Protective Services (CPS) seems most similar to the problems reported in the video from the Austin American-Statesman?';

const POLL_CHOICES = [
	{
		id: 0,
		family_id: 'choice-0',
		body: 'Issue 1'
	},
	{
		id: 1,
		family_id: 'choice-1',
		body: 'Issue 2'
	},
	{
		id: 2,
		family_id: 'choice-2',
		body: 'Issue 5'
	},
	{
		id: 3,
		family_id: 'choice-3',
		body: 'Issue 7'
	}
];

const Index: NextPage = () => {
	const [viewMode, setViewMode] = useState<'response' | 'dataset'>('dataset');
	const [isInstructorView, setInstructorView] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submissionError, setSubmissionError] = useState(null);
	const [answer, setAnswer] = useState({
		id: 123456789,
		body: 'choice-1',
		question_family_id: 'prototype',
		updated_at: new Date().toISOString(),
		completed: true,
		data: {
			class: [
				{
					label: 'Issue 1',
					data: 35
				},
				{
					label: 'Issue 2',
					data: 15
				},
				{
					label: 'Issue 5',
					data: 30
				}
			],
			texas: [
				{
					label: 'Issue 1',
					data: 40
				},
				{
					label: 'Issue 2',
					data: 50
				},
				{
					label: 'Issue 5',
					data: 10
				}
			]
			/*
			unitedStates: [
				{
					label: 'Issue 1',
					data: 80
				},
				{
					label: 'Issue 2',
					data: 20
				},
				{
					label: 'Issue 5',
					data: 10
				}
			]
			*/
		}
	});

	const handleToggleView = useCallback(() => {
		setInstructorView((old) => !old);
	}, []);

	const onChoiceSelected = (choice: string) => {
		setIsSubmitting(true);
		setSubmissionError(null);

		fetch('/api/savePoll', {
			method: 'POST',
			body: JSON.stringify({
				choice_family_id: choice
			})
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				setAnswer({
					id: 123456789,
					body: choice,
					question_family_id: 'prototype',
					updated_at: new Date().toISOString(),
					completed: true,
					data: res.graph_data
				});
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	return (
		<ThemeProvider theme={themes['universal_velvet']}>
			<TopBar>
				<div css={knobsStyles}>
					<h1>Polls refresh prototype</h1>
					<button onClick={handleToggleView}>
						Switch to {isInstructorView ? 'Student' : 'Instructor'} View
					</button>
					<label>
						View mode
						<select
							value={viewMode ?? ''}
							onChange={(e) => setViewMode(e.target.value as 'response' | 'dataset')}>
							<option value="dataset">group by dataset</option>
							<option value="response">group by response</option>
						</select>
					</label>
				</div>
			</TopBar>
			<main css={mainStyles}>
				<Text
					online
					element={{
						body: `
						<h1>Sample Page</h1>
						<p>Praesent arcu lectus, aliquam id faucibus nec, varius non est. Praesent et leo eu purus venenatis bibendum ut eget metus..</p>
					`
					}}
				/>

				<PollQuestion
					questionFamilyId="prototype"
					body={POLL_BODY}
					answer={answer}
					online
					choices={POLL_CHOICES}
					submitting={isSubmitting}
					submissionError={submissionError}
					onChoiceSelected={onChoiceSelected}
					viewMode={viewMode}
				/>

				<Text
					online
					element={{
						body: `
						<p>Pellentesque elementum tincidunt dolor. Nunc lacinia in libero non efficitur. In vitae arcu eros. Donec tincidunt purus in est porttitor ornare. Sed commodo lacus a dolor molestie, a tincidunt tellus molestie.</p>
					`
					}}
				/>
			</main>
		</ThemeProvider>
	);
};
export default Index;

const mainStyles = css`
	padding-top: 20px;
	max-width: 800px;
	margin: 0 auto;
`;

const knobsStyles = css`
	display: flex;
	margin-left: 4rem;
	align-items: center;
	column-gap: 2rem;

	label {
		font-weight: 500;
	}

	select {
		margin-left: 1rem;
	}
`;
