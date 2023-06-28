import React, { useCallback, useEffect, useRef, useState } from 'react';
import { schemeCategory10, schemePastel2 } from 'd3-scale-chromatic';
import { arc, pie } from 'd3-shape';
import { darken } from 'polished';
import { axisBottom, axisLeft, axisTop } from 'd3-axis';
import { select } from 'd3-selection';
import { transpose, max, sum, merge } from 'd3-array';
import { scaleOrdinal, scaleBand, scaleLinear } from 'd3-scale';
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

const shapedData = [
	['class', 'texas', 'usa'],
	[35, 40, 80],
	[15, 50, 20],
	[30, 10, 10]
];

const RefreshedResults: React.FC<Props> = (props) => {
	const { data: graphData, sections, orderedChoices } = props;

	const ref = useRef();

	const margin = { top: 20, right: 0, bottom: 40, left: 140 };
	const width = 650 - margin.left - margin.right;
	const height = 600 - margin.top - margin.bottom;

	useEffect(() => {
		const svg = select(ref.current);
		svg.selectAll('*').remove();
		draw();
	}, []);

	const draw = () => {
		const finalWidth = width + margin.left + margin.right;
		const finalHeight = height + margin.top + margin.bottom;

		const svg = select(ref.current)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
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
			.tickSizeInner(height * 2);

		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0, 0)`)
			.call(axisX)
			.selectAll('text')
			.attr('dy', `-${height * 2 + 7}px`);

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

		/**
		 * For last .style('text-anchor', 'end')
		 */

		console.log(graphData);

		const getGroupByChoice = (choice: string) => {
			const choiceIndex = orderedChoices.indexOf(choice);
			const group = shapedData[choiceIndex + 1];
			return group;
		};

		const getGroupByData = (section: string) => {
			const groupIndex = (shapedData[0] as string[]).indexOf(section);
			const group = shapedData
				.filter((g, i) => (i == 0 ? false : true))
				.map((group) => group[groupIndex]);
			return group;
		};

		const drawSections = () => {
			const groupMargin = { top: 50, bottom: 40 };
			const barHeight = 24;

			const groupScaleY = scaleBand()
				.range([margin.top + groupMargin.top, height])
				.domain(shapedData[0] as string[])
				.padding(0.5);

			const datasets = shapedData[0] as string[];

			const something = datasets.map((dataset, datasetIndex) => {
				// get a group in order of question choice from a section of the dataset
				const group = getGroupByData(dataset);
				const topOfGroupY = groupScaleY(dataset) - groupScaleY.step();

				/**
				 * inner y-axis
				 */
				const y = scaleBand()
					.range([topOfGroupY, groupScaleY(dataset)])
					.domain(orderedChoices)
					.padding(0.5);
				const yAxis = axisLeft(y).tickSize(0);

				// draw labels, make y domain line invisible
				svg.append('g').call(yAxis).attr('class', 'yAxis').attr('font-size', '10px');
				svg.selectAll('.yAxis path').attr('stroke-width', 0);

				// draw bars
				svg
					.append('g')
					.selectAll('bars')
					.data(group)
					.enter()
					.append('rect')
					.attr('x', x(0))
					.attr('y', (d, i) => y(orderedChoices[i]) - 2)
					.attr('width', (d) => x(d as number))
					.attr('height', barHeight)
					.attr('fill', uvPollColors[datasetIndex])
					.attr('stroke', 'black')
					.attr('stroke-width', '1px')
					.attr('rx', 3);

				// draw divider line
				svg
					.append('line')
					.style('stroke', DOMAIN_LINE_COLOR)
					.style('stroke-width', 2)
					.attr('x1', margin.left * -1)
					.attr('y1', groupScaleY(dataset))
					.attr('x2', width)
					.attr('y2', groupScaleY(dataset));

				// draw dataset label
				svg
					.append('text')
					.text(dataset.toUpperCase())
					.attr('font-weight', 'bold')
					.attr('x', -(margin.left + margin.right))
					.attr('y', topOfGroupY + 10)
					.attr('dx', 0)
					.attr('dy', 24);
			});

			return;

			Object.keys(sections).forEach((section, i) => {
				const sectionData = sections[section];

				const yDomainStart = groupMargin.top + (barHeight + groupMargin.bottom) * i;
				const yDomainEnd = (height / 2) * (i + 1) - 30;

				// Y axis
				const y = scaleBand()
					.range([yDomainStart, yDomainEnd])
					.domain(sectionData.map((d) => d.label))
					.padding(0.5);

				const yAxis = axisLeft(y).tickSize(0);

				// make y domain line invisible
				svg.append('g').call(yAxis).attr('class', 'yAxis').attr('font-size', '10px');
				svg.selectAll('.yAxis path').attr('stroke-width', 0);

				svg
					.append('g')
					.selectAll('myRect')
					.data(sectionData)
					.enter()
					.append('rect')
					.attr('x', x(0))
					.attr('y', (d) => y(d.label))
					.attr('width', (d) => x(d.data))
					.attr('height', barHeight)
					.attr('fill', uvPollColors[i])
					.attr('stroke', 'black')
					.attr('stroke-width', '1px')
					.attr('rx', 3);

				// section seperation line
				svg
					.append('line')
					.style('stroke', DOMAIN_LINE_COLOR)
					.style('stroke-width', 2)
					.attr('x1', margin.left * -1)
					.attr('y1', yDomainEnd)
					.attr('x2', width)
					.attr('y2', yDomainEnd);
			});
		};

		drawSections();
	};

	if (!graphData) {
		return <p>No answer</p>;
	}

	return (
		<>
			<div className="poll-results" css={pollResultsStyles}>
				<QuestionPrompt body={'Poll Responses'} />
				<p>Compare the results below with your class, the state of Texas, and the United States.</p>
				<svg ref={ref} style={{ border: '1px solid #00000009', overflowX: 'visible' }} />
			</div>
		</>
	);
};

export default RefreshedResults;
