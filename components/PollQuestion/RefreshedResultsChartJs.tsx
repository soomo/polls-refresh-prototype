import React, { useCallback, useEffect, useRef, useState } from 'react';
import { schemeCategory10, schemePastel2 } from 'd3-scale-chromatic';
import { arc, pie } from 'd3-shape';
import { darken } from 'polished';
import { axisBottom, axisLeft, axisTop } from 'd3-axis';
import { select } from 'd3-selection';
import { transpose, max, sum, merge } from 'd3-array';
import { scaleOrdinal, scaleBand, scaleLinear, scalePoint, scaleThreshold } from 'd3-scale';
import { format } from 'd3-format';

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
	orderedChoices: string[];
	viewMode: 'response' | 'dataset';
	classOnly?: boolean;
}

function truncateString(str: string, num: number) {
	if (str.length <= num) {
		return str;
	}
	return str.slice(0, num).trim() + '...';
}

export const valueOf = (value: any) => {
	if (/%$/.test(value))
		return { type: 'percent', value: value.replace(/%$/, '') / 100, label: value };

	if (/^-?\$/.test(value)) {
		return { type: 'money', value: parseFloat(value.replace(/\$/, '')), label: value };
	}

	return { type: 'number', value: parseFloat(value), label: value };
};

export const getFormat = (value: string) => {
	switch (value) {
		case 'percent':
			return format('.0%');
		default:
			return format('');
	}
};

const LIGHT_TICK_COLOR = '#E6E6E6';
const DOMAIN_LINE_COLOR = '#B3B3B3';

const RefreshedResults: React.FC<Props> = (props) => {
	const { data: graphData, orderedChoices, viewMode, classOnly } = props;
	const ref = useRef();

	const shapedData = [
		!classOnly ? ['Class', 'Texas', 'United States'] : ['Class'],
		[35, 40, 80],
		[15, 50, 20],
		[30, 10, 10],
		[60, 20, 27],
		[15, 50, 20],
		[0, 0, 0]
	];

	const barHeight = 24;
	// stuff
	const barMargin = { top: 33, bottom: 10 };
	// number of bars per group
	const factor = viewMode === 'response' ? orderedChoices.length : shapedData[0].length;
	// number of groups
	const base = viewMode === 'response' ? shapedData[0].length : orderedChoices.length;
	// calculated total height of chart
	const height22 = (barHeight + barMargin.bottom) * base * factor;
	//console.log({ base, factor, height22 });
	const margin = { top: 40, right: 0, bottom: 40, left: 160 };
	const width = 600 - margin.left - margin.right;
	const height = height22 - barMargin.bottom * 2;
	const labelWidth = margin.left / 2;

	useEffect(() => {
		console.log(shapedData);

		const svg = select(ref.current);
		svg.selectAll('*').remove();
		draw();
	}, [viewMode, classOnly]);

	const draw = () => {
		const finalWidth = width + margin.left + margin.right;
		const finalHeight = height + margin.top + margin.bottom;

		const svg = select(ref.current)
			.attr('width', finalWidth)
			.attr('height', finalHeight)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('viewBox', `0 0 ${finalWidth} ${finalHeight}`);

		// x axis
		const xAxis = scaleLinear().domain([0, 100]);
		const x = xAxis.range([0, width]);
		const axisX = axisBottom(x)
			.ticks(5)
			.tickFormat((d) => `${d}%`)
			.tickSizeOuter(0)
			.tickSizeInner(finalHeight);

		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0, 0)`)
			.call(axisX)
			.selectAll('text')
			.attr('dy', `-${finalHeight + 7}px`);

		// tick color
		svg.selectAll('.tick line').attr('stroke', LIGHT_TICK_COLOR);

		// extra line on-top of domain
		svg
			.append('line')
			.style('stroke', DOMAIN_LINE_COLOR)
			.style('stroke-width', 2)
			.attr('x1', margin.left * -1)
			.attr('y1', 0)
			.attr('x2', width)
			.attr('y2', 0);

		const getGroupByChoice = (choice: string) => {
			const choiceIndex = orderedChoices.indexOf(choice);
			const group = shapedData[choiceIndex + 1];
			return group;
		};

		const getGroupByData = (section: string) => {
			const groupIndex = (shapedData[0] as unknown as string[]).indexOf(section);
			const group = shapedData
				.filter((g, i) => (i == 0 ? false : true))
				.map((group) => group[groupIndex]);
			return group;
		};

		const drawSections = () => {
			const groupScaleYDomain =
				viewMode === 'response' ? orderedChoices : (shapedData[0] as unknown as string[]);
			const modeData =
				viewMode === 'response' ? orderedChoices : (shapedData[0] as unknown as string[]);

			const groupScaleY = scaleLinear().range([0, height22]).domain([0, groupScaleYDomain.length]);

			modeData.map((datad, datadIndex) => {
				// get a group in order of question choice from a section of the dataset
				const group = viewMode === 'response' ? getGroupByChoice(datad) : getGroupByData(datad);
				const topOfGroupY = groupScaleY(datadIndex);

				/**
				 * inner y-axis
				 */
				const y = scaleBand()
					.domain([
						...(viewMode === 'response'
							? (shapedData[0] as unknown as string[])
							: orderedChoices.map((c) => c))
					])
					.range([groupScaleY(datadIndex), groupScaleY(datadIndex + 1)])
					.paddingOuter(0.4)
					.paddingInner(0.2);

				console.log('bandwidth: ', y.bandwidth());

				const yAxis = axisLeft(y)
					.tickSize(0)
					.tickFormat((d) => truncateString(d, 13));

				// draw labels, make y domain line invisible
				svg.append('g').call(yAxis).attr('class', 'yAxis');
				svg.selectAll('.yAxis path').attr('stroke-width', 0);

				// draw bars
				svg
					.append('g')
					.selectAll('bars')
					.data(group)
					.enter()
					.append('rect')
					.attr('x', x(0))
					.attr('y', (d, i) => {
						return y(
							viewMode === 'response' ? (shapedData[0][i] as unknown as string) : orderedChoices[i]
						);
					})
					.attr('width', (d) => x(d as number) || 1)
					.attr('height', y.bandwidth())
					.attr('fill', uvPollColors[datadIndex])
					.attr('stroke', 'black')
					.attr('stroke-width', '1px')
					.attr('rx', 3);

				svg
					.append('g')
					.selectAll('percentLabels')
					.data(group)
					.enter()
					.append('text')
					.text((d) => `${d}%`)
					.attr('x', (d) => x(d as number) + 5)
					.attr('y', (d, i) => {
						return y(
							viewMode === 'response' ? (shapedData[0][i] as unknown as string) : orderedChoices[i]
						);
					})
					.attr('font-size', '10px')
					.attr('font-family', 'Helvetica')
					.attr('dy', y.bandwidth() / 1.5);

				// draw divider line
				svg
					.append('line')
					.style('stroke', DOMAIN_LINE_COLOR)
					.style('stroke-width', 2)
					.attr('x1', margin.left * -1)
					.attr('y1', groupScaleY(datadIndex))
					.attr('x2', width)
					.attr('y2', groupScaleY(datadIndex));

				// draw dataset label
				svg
					.append('foreignObject')
					.attr('width', labelWidth)
					.attr('height', 60)
					.attr('x', -(margin.left + margin.right))
					.attr('y', topOfGroupY + 10)
					.attr('dx', 0)
					.attr('dy', 13)
					.append('xhtml:div')
					.style('color', '#000')
					.style('width', '100%')
					.style('height', '100%')
					.style('font-size', `13px`)
					.style('font-weight', 'bold')
					.style('overflow-y', 'auto')
					.html(datad === 'Class' ? 'Your classmates' : datad);
			});
		};

		drawSections();

		/**
		 * DEBUG LABELS AND LINES
		 */

		/*
		svg
			.append('line')
			.style('stroke', 'red')
			.style('stroke-width', 2)
			.attr('x1', margin.left * -1)
			.attr('y1', 0)
			.attr('x2', width)
			.attr('y2', 0);
		*/

		/*
		svg
			.append('rect')
			.style('fill', '#00ff0022')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', width)
			.attr('height', height22());
			*/
	};

	if (!graphData) {
		return <p>No answer</p>;
	}

	return (
		<>
			<div className="poll-results" css={pollResultsStyles}>
				<QuestionPrompt body={'Poll Responses'} />
				<p>Compare the results below with your class, the state of Texas, and the United States.</p>
				<svg
					ref={ref}
					style={{
						border: '1px solid #00000000',
						borderBottom: `2px solid ${DOMAIN_LINE_COLOR}`,
						overflowX: 'visible'
					}}
				/>
			</div>
		</>
	);
};

export default RefreshedResults;
