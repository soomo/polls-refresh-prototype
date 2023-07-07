import React, { useState } from 'react';

import { withErrorBoundary, errorMessage } from '@soomo/lib/components/GenericErrorBoundary';
import { PollIcon } from '@soomo/lib/components/icons';
import { Indeterminate } from '@soomo/lib/components/Loaders';
import { Offline } from '@soomo/lib/components/Offline';
import { UniversalVelvetLeftBorder } from '@soomo/lib/components/pageElements';
import {
	QuestionType,
	WebtextQuestion,
	QuestionPrompt,
	QuestionChoices
} from '@soomo/lib/components/shared/Question';
import WebtextButton from '@soomo/lib/components/WebtextButton';
import { useAccessibilityFocus, useIsUniversalVelvet } from '@soomo/lib/hooks';
import { Answer } from '@soomo/lib/types';
import { FamilyId, QuestionChoice } from '@soomo/lib/types/WebtextManifest';

import styles from './styles';
import RefreshedResultsChartJs from './RefreshedResultsChartJs';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import PollData from './PollData';

interface Props {
	questionFamilyId: string;
	body: string;
	choices: QuestionChoice[];
	answer?: Answer;
	onChoiceSelected?: (family_id: string) => void;
	onChangeSelectedOption?: (family_id: string) => void;
	online: boolean;
	submitting: boolean;
	submissionError: Error;
	mobile?: boolean;
	readOnly?: boolean;
	viewMode: 'response' | 'dataset';
	classOnly?: boolean;
	/**
	 * Temporary
	 */
	noBottomMargin?: boolean;
}

const PollQuestion: React.FC<Props> = (props) => {
	const {
		questionFamilyId,
		body,
		choices,
		answer,
		onChoiceSelected,
		onChangeSelectedOption,
		online,
		submissionError,
		submitting,
		mobile,
		readOnly,
		viewMode,
		classOnly
	} = props;
	const [selectedOption, setSelectedOption] = useState<string>(null);
	const [userActed, setUserActed] = useState(false);
	const [headingRef, setFocusToHeading] = useAccessibilityFocus();
	const completedAnswer = answer && answer.completed;
	const completedAnswerWithData = completedAnswer && answer.data;
	const completedAnswerWithoutData = completedAnswer && !answer.data;
	const loading = online && !submissionError && (submitting || completedAnswerWithoutData);
	const ableToSubmit = (!answer || !answer.completed) && !submitting && !loading;
	const isUniversalVelvet = useIsUniversalVelvet();

	let ariaHeading = null;
	const loadingText = 'Retrieving responses from your peers.';

	if (userActed) {
		if (loading) {
			ariaHeading = loadingText;
		} else if (completedAnswerWithData) {
			ariaHeading = 'results displayed below';
		}
	} else {
		ariaHeading = '';
	}

	const selectChoice = () => {
		setUserActed(true);
		setFocusToHeading().then(() => {
			onChoiceSelected(selectedOption);
		});
	};

	const changeSelectedChoice = (choiceFamilyId: FamilyId) => {
		setSelectedOption(choiceFamilyId);
		onChangeSelectedOption?.(questionFamilyId);
	};

	return (
		<div className="poll-question" css={styles}>
			<div className="question">
				{(!answer || !answer.data) && (
					<div className="poll-question-form">
						<QuestionChoices
							questionFamilyId={questionFamilyId}
							choices={choices}
							disabled={readOnly || !ableToSubmit}
							selectedChoiceFamilyId={completedAnswer ? answer.body : selectedOption}
							onChangeSelectedChoice={changeSelectedChoice}
						/>
						{submissionError &&
							errorMessage('An error occurred while submitting your answer.', 'submissionError')}
						<div className="status-and-actions">
							<div className="save-button-container">
								{completedAnswer && !online && <span>Response saved.</span>}
								{loading && (
									<span className="loading">
										<Indeterminate size={20} aria-hidden={true} />
										<span>{loadingText}</span>
									</span>
								)}
								{ableToSubmit && !submitting && (
									<WebtextButton
										type="submit"
										value="Save"
										onClick={selectChoice}
										disabled={readOnly || (!selectedOption && (!answer || !!answer.completed))}>
										Save
									</WebtextButton>
								)}
							</div>
						</div>
					</div>
				)}
				{completedAnswerWithData && (
					<div>
						<Tabs defaultSelectedTab="chart">
							<TabList aria-label="poll question tabs">
								<Tab tab="chart">Chart</Tab>
								<Tab tab="data">Data</Tab>
							</TabList>
							<TabPanel tab="chart">
								{/* <PollResults data={answer.data} /> */}
								{/* <RefreshedResults data={answer.data} sections={answer.data} /> */}
								<RefreshedResultsChartJs
									data={answer.data}
									sections={answer.data}
									orderedChoices={choices.map((c) => c.body)}
									viewMode={viewMode}
									classOnly={classOnly}
								/>
							</TabPanel>
							<TabPanel tab="data">
								<PollData />
							</TabPanel>
						</Tabs>
					</div>
				)}
			</div>
			{!online && ableToSubmit && (
				<Offline
					mobile={mobile}
					standalone={false}
					contentDescription="After you respond, come back when you’re online to see your classmates’ answers."></Offline>
			)}
			{!online && (completedAnswerWithoutData || submitting) && (
				<Offline
					mobile={mobile}
					standalone={false}
					contentDescription="Once you’re back online, you’ll see your classmates’ responses here."></Offline>
			)}
		</div>
	);
};

export default withErrorBoundary(PollQuestion);
