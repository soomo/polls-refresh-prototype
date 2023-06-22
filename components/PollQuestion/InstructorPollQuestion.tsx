import React from 'react';
import { css } from '@emotion/core';

//import { QuestionPrompt, QuestionType, WebtextQuestion } from '~/components/shared/Question';
import {
	QuestionPrompt,
	QuestionType,
	WebtextQuestion
} from '@soomo/lib/components/shared/Question';
import { Answer } from '@soomo/lib/types';
import { useIsUniversalVelvet } from '@soomo/lib/hooks';
import { PollIcon } from '@soomo/lib/components/icons';
import PollResults from './PollResults';
import styles from './styles';
import UniversalVelvetLeftBorder from '@soomo/lib/components/pageElements/UniversalVelvetLeftBorder';

interface Props {
	questionId: string;
	body: string;
	answer: Answer;
	/**
	 * Temporary
	 */
	noBottomMargin?: boolean;
}

const instructorStyles = (theme) => css`
	${styles(theme)};
	.poll-results {
		margin: 0;
	}
`;

const InstructorPollQuestion: React.FC<Props> = (props) => {
	const isUniversalVelvet = useIsUniversalVelvet();

	return (
		<WebtextQuestion noBottomMargin={props.noBottomMargin}>
			<UniversalVelvetLeftBorder>
				<QuestionType>
					{isUniversalVelvet && <PollIcon />}
					Poll Question
				</QuestionType>
				<QuestionPrompt body={props.body} gutterBottom />
				<div css={instructorStyles}>
					<PollResults data={props.answer.data} />
				</div>
			</UniversalVelvetLeftBorder>
		</WebtextQuestion>
	);
};

export default InstructorPollQuestion;
