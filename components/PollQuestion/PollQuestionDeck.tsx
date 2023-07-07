/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useRef, useState } from 'react';
import { css } from '@emotion/core';
import { FamilyId } from '@soomo/lib/types/WebtextManifest';
import { UniversalVelvetLeftBorder } from '@soomo/lib/components/pageElements';
import { QuestionType, WebtextQuestion } from '@soomo/lib/components/shared/Question';

import CollapseableQuestion, { MCQRef } from './CollapseableQuestion';
import { PollIcon } from '@soomo/lib/components/icons';
import { AnswerMode } from '../../pages';

const BODIES = [
	'If you had to select one personal trait that is most important to you, which of the following would you choose?',
	'How important are efforts focused on protecting the environment and conservation to you (e.g., clean air, endangered wildlife, resource management, preserving wilderness areas, etc.)?',
	'Which statement resonates the most with you regarding patriotism? You may feel that more than one statement is valid, but choose the one that most strongly aligns with your views.',
	'If you heard about a situation where employees at a large company went on strike against the business owners and managers, which side would you typically sympathize with?',
	'How important is religious faith or spiritual practice in your life?',
	'Which factor is most important to you when thinking about your dream job? You may feel that more than one statement is valid, but pick the one that most strongly aligns with your ideal.'
];

interface Props {
	mode: 'results' | 'return-to';
	answerMode: AnswerMode;
}

const PollQuestionDeck: React.FC<Props> = (props) => {
	const { mode, answerMode } = props;

	const [expandedQuestionsMap, setExpandedQuestionsMap] = useState<{
		[familyId: FamilyId]: boolean;
	}>(
		BODIES.reduce((acc, body, i) => {
			acc[`question-${i}`] = true;
			return acc;
		}, {})
	);

	const [activePoolQuestionIndexesMap, setActivePoolQuestionIndexesMap] = useState(
		Object.fromEntries(BODIES.map((poolElement, i) => [`question-${i}`, 0]))
	);

	/*
	const [responsesMap, setResponsesMap] = useState<{
		[poolElementFamilyId: FamilyId]: SaveMCQuestionResponse;
	}>({});
    */

	const mcqRefs = useRef<MCQRef[]>(Array(BODIES.length));

	/*
	const firstUnansweredQuestionFamilyId = poolElements.find(
		(poolEl) => responsesMap[poolEl.family_id] == null
	)?.family_id;
    */

	const handleToggleExpanded = useCallback((familyId: string) => {
		setExpandedQuestionsMap((oldExpandedQuestions) => {
			return { ...oldExpandedQuestions, [familyId]: !oldExpandedQuestions[familyId] };
		});
	}, []);

	const isAnswered = (i: number) => {
		if (answerMode === 'all') {
			return true;
		} else if (answerMode === 'some') {
			if (i > 2) {
				return true;
			}
		} else if (answerMode === 'none') {
			return false;
		}
	};

	const moreExpanded = Object.values(expandedQuestionsMap).filter((v) => v).length >= 3;

	return (
		<div css={styles}>
			<WebtextQuestion>
				<UniversalVelvetLeftBorder>
					<div className="top-container">
						<QuestionType className="question-type">
							<PollIcon />
							{BODIES.length} Poll Questions
						</QuestionType>
						<button
							className="collapse-button"
							onClick={() => {
								setExpandedQuestionsMap(
									BODIES.reduce((acc, body, i) => {
										acc[`question-${i}`] = moreExpanded ? false : true;
										return acc;
									}, {})
								);
							}}>
							{moreExpanded ? 'Collapse All' : 'Expand All'}
						</button>
					</div>

					<div className="questions">
						{BODIES.map((body, i) => {
							console.log({ isAnswered: isAnswered(i) });

							return (
								<CollapseableQuestion
									key={`question-${i}`}
									family_id={`question-${i}`}
									expanded={expandedQuestionsMap[`question-${i}`]}
									onToggleExpanded={(fid) => {
										handleToggleExpanded(fid);
									}}
									body={body}
									answered={isAnswered(i)}
									mode={mode}
								/>
							);
						})}
					</div>
				</UniversalVelvetLeftBorder>
			</WebtextQuestion>
		</div>
	);
};

export default PollQuestionDeck;

const styles = css`
	position: relative;

	.question-deck-icon {
		width: 25px;
		height: 25px;
		margin-right: 0;
	}

	.collapse-button {
		align-self: flex-end;
	}

	.top-container {
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: space-between;
		margin-bottom: 28px;

		button {
			margin: 0;
			background: none;
			border: none;
			height: 100%;
			font-size: 20px;
			color: #570dd6;
			text-decoration: underline;
			cursor: pointer;
		}
	}

	div[data-testid='question-type'] {
		margin-bottom: 0;
	}

	.questions {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	.backdrop {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);

		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: -100vw;
			right: 0;
			border-left: 100vw solid rgba(0, 0, 0, 0.5);
			box-shadow: 100vw 0 0 rgba(0, 0, 0, 0.5);
		}
	}
`;
