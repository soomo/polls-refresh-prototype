/* eslint-disable no-mixed-spaces-and-tabs */
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState
} from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { css } from '@emotion/core';
import { QuestionPrompt } from '@soomo/lib/components/shared/Question';
import ExclaimIcon from './ExclaimIcon';
import PollAliasQuestion from './PollAliasQuestion';
import { POLL_CHOICES } from '../../pages';

const pivotarIconProps = {
	size: 21,
	'aria-hidden': true
};

interface Props {
	answered?: boolean;
	expanded?: boolean;
	onToggleExpanded: (familyId: string) => void;
	body: string;
	family_id: string;
	mode: 'results' | 'return-to';
}

export interface MCQRef {
	rejoinderElement: HTMLDivElement;
}

const CollapseableQuestion = forwardRef<MCQRef, Props>(
	({ expanded, onToggleExpanded, answered, body, family_id, mode }, ref) => {
		const contentDivId = `${family_id}-content`;
		const rejoinderRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(
			ref,
			() => ({
				rejoinderElement: rejoinderRef.current
			}),
			[]
		);

		const handleClick = useCallback(() => {
			onToggleExpanded(family_id);
		}, [onToggleExpanded, family_id]);

		return (
			<div css={styles}>
				<button
					className="prompt-and-pivotar"
					aria-expanded={expanded ?? false}
					aria-controls={contentDivId}
					data-answered={answered}
					onClick={handleClick}>
					<div className="prompt">
						<QuestionPrompt body={body} />
					</div>

					{expanded ? (
						<FaChevronUp {...pivotarIconProps} color="#5f01df" />
					) : (
						<FaChevronDown {...pivotarIconProps} color="#5f01df" />
					)}
				</button>
				<div id={contentDivId} className="content" hidden={!expanded}>
					{mode === 'results' && (
						<PollAliasQuestion
							questionFamilyId={family_id}
							body={body}
							online
							choices={POLL_CHOICES}
							submitting={false}
							submissionError={null}
							viewMode="dataset"
							answer={
								answered
									? {
											id: 123456789,
											body: 'choice-1',
											question_family_id: 'prototype',
											updated_at: new Date().toISOString(),
											completed: true,
											data: {},
											correct: true,
											created_at: new Date().toISOString(),
											first_saved_at: new Date().toISOString(),
											quiz_response_id: 10
									  }
									: undefined
							}
						/>
					)}
					{mode === 'return-to' &&
						(answered ? (
							<PollAliasQuestion
								questionFamilyId={family_id}
								body={body}
								online
								choices={POLL_CHOICES}
								submitting={false}
								submissionError={null}
								viewMode="dataset"
								answer={{
									id: 123456789,
									body: 'choice-1',
									question_family_id: 'prototype',
									updated_at: new Date().toISOString(),
									completed: true,
									data: {},
									correct: true,
									created_at: new Date().toISOString(),
									first_saved_at: new Date().toISOString(),
									quiz_response_id: 10
								}}
							/>
						) : (
							<div className="return-to-container">
								<div className="to-see-results">To see results, answer the poll question in:</div>

								<strong>Page 1.7: </strong>
								<a>Taking an Audience-Centered Approach</a>
							</div>
						))}
				</div>
			</div>
		);
	}
);

CollapseableQuestion.displayName = 'CollapseableQuestion';

export default CollapseableQuestion;

const styles = () => css`
	border: 1px solid #c9c9c9;
	border-radius: 0.5rem;

	.prompt-and-pivotar {
		position: relative;
		display: grid;
		width: 100%;
		padding: 1rem 1.5rem;
		grid-template-columns: 1fr auto;
		align-items: flex-start;
		column-gap: 1.5rem;
		align-items: center;
		font: inherit;
		border: none;
		background: none;
		cursor: pointer;
		text-align: initial;

		&[aria-expanded='false'][data-answered='true'] .correctness-and-prompt .question-body {
			display: -webkit-box;
			overflow: hidden;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			color: rgba(0, 0, 0, 0.5);
		}

		// QuestionPrompt outer div
		div:last-of-type {
			display: inline;
		}

		// QuestionPrompt inner div
		.question-body {
			margin: 0;
		}
	}

	.content {
		padding: 1rem 1.5rem;

		fieldset {
			margin: 0;
			padding: 0;
			border: none;
		}

		.divider-and-save {
			padding: 1.5rem 2rem;
		}

		hr {
			margin: 0 0 1rem;
			border-top: 1px solid #ccc;
			border-bottom: none;
		}

		button:not(.soomo-tab) {
			padding: 0.5rem 2.5rem;
			font-weight: 500 !important;
		}

		.question-choices {
			margin-bottom: 1em;
		}
	}

	.return-to-container {
		font-size: 16px;
		font-weight: 700;

		.to-see-results {
			font-size: 22px;
			font-weight: 400;
			margin-bottom: 0.5rem;
		}

		strong {
			margin-left: 2rem;
		}

		a {
			color: #570dd6;
			text-decoration: underline;
		}
	}
`;
