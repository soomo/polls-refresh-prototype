import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { schemeCategory10, schemePastel2 } from 'd3-scale-chromatic';

import { BarGroupHorizontal, Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft, AxisTop } from '@visx/axis';
import cityTemperature, { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';
import { scaleBand, scaleLinear, scaleOrdinal, scalePoint } from '@visx/scale';
import { Text } from '@visx/text';

import { useIsUniversalVelvet } from '@soomo/lib/hooks';
import { QuestionPrompt } from '@soomo/lib/components/shared/Question';
import { pollResultsStyles } from './styles';

const uvPollColors = [
	'#5F01DF',
	'#41EAD4',
	'#FA9F1B',
	'#F71735',
	'#F5EE9D',
	'#0F5C55',
	'#FF4400',
	'#48ACF0',
	'#99FC00',
	'#80A4ED',
	'#930353',
	'#0062FF',
	'#010001'
];

type DataArray = Array<{
	label: string;
	data: number;
}>;

interface Props {
	data: DataArray;
	sections: Record<string, DataArray>;
}

const data = [
	{
		label: 'Issue 1',
		class: 10,
		texas: 20,
		unitedStates: 70
	},
	{
		label: 'Issue 2',
		class: 20,
		texas: 30,
		unitedStates: 50
	},
	{
		label: 'Issue 5',
		class: 30,
		texas: 10,
		unitedStates: 60
	}
	/*
	{
		label: 'Issue 7',
		class: 15,
		texas: 20,
		unitedStates: 65
	},
	{
		label: 'Issue 8',
		class: 60,
		texas: 35,
		unitedStates: 5
	}
	*/
];

const width = 600;
const height = data.length * 110;
const verticalMargin = 120;

const RefreshedResultsChartJs: React.FC<Props> = (props) => {
	const { data: graphData, sections } = props;

	const defaultMargin = { top: 50, right: 0, bottom: 20, left: 0 };
	const sectionKeys = Object.keys(sections);

	const xMax = width - 200;
	const yMax = height;

	// scales, memoize for performance
	const xScale = useMemo(
		() =>
			scaleLinear<number>({
				domain: [0, 100],
				range: [0, xMax]
			}),
		[xMax]
	);

	if (!graphData) {
		return <p>No answer</p>;
	}

	//yScale.rangeRound([0, yMax]);

	return (
		<>
			<div className="poll-results" css={pollResultsStyles}>
				<QuestionPrompt body={'Poll Responses'} />
				<p>Compare the results below with your class, the state of Texas, and the United States.</p>
				<svg width={width} height={height}>
					<Group top={verticalMargin / 2} left={100}>
						{data.map((row, i) => {
							const barHeight = 30;
							const groupGap = 30;
							const barGap = 5;

							const calcY = (
								groupGap: number,
								barGap: number,
								i: number,
								j: number,
								rowsLength: number
							) => {
								return (
									barHeight * i * rowsLength + (barHeight + barGap) * j + i * (groupGap + barGap)
								);
							};

							return (
								<Group key={`${row.label}-${i}`} top={10}>
									{Object.keys(row)
										.filter((k) => k !== 'label')
										.map((key, j, rows) => {
											const rowData = row[key] as number;
											const barWidth = xScale(rowData);
											const barX = 0;
											const barY = calcY(groupGap, barGap, i, j, rows.length);

											return [
												<Text
													key={`label-${key}-${i}`}
													x={-10}
													y={barY + 19}
													textAnchor="end"
													fontSize={14}>
													{key}
												</Text>,
												<Bar
													key={`bar-${key}-${i}`}
													x={barX}
													y={barY}
													width={barWidth}
													height={barHeight}
													fill={uvPollColors[i]}
													style={{ border: '1px solid black' }}
													stroke="black"
													strokeWidth={1}
													rx={3}
												/>
											];
										})}
									{/* <Text
										x={-100}
										y={calcY(
											groupGap,
											barGap + 1,
											i,
											Object.keys(row).filter((k) => k !== 'label').length / 2,
											Object.keys(row).filter((k) => k !== 'label').length
										)}>
										{row.label}
										</Text> */}
								</Group>
							);
						})}

						<AxisTop scale={xScale} />
					</Group>
				</svg>
			</div>
		</>
	);
};

export default RefreshedResultsChartJs;
