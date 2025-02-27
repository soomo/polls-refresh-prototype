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

const RefreshedResults: React.FC<Props> = (props) => {
	const { data: graphData, sections } = props;
	const isUniversalVelvet = useIsUniversalVelvet();
	const colors = isUniversalVelvet ? uvPollColors : schemeCategory10;
	const chartData = sections['class'].map((row) => [row.label, row.data]);

	const ref = useRef();

	const margin = { top: 20, right: 0, bottom: 40, left: 100 };
	const width = 600 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	useEffect(() => {
		const svg = select(ref.current);
		svg.selectAll('*').remove();
		draw();
	}, []);

	const draw = () => {
		let categories: any = transpose(chartData);
		const categoryLabels: Array<any> = categories.shift();
		categories = transpose(categories).map((row) =>
			row.map((value: any) => {
				return valueOf(value);
			})
		);

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
		const axisX = axisTop(x)
			.ticks(5)
			.tickFormat((d) => `${d}%`);

		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(0, 0)`)
			.call(axisX)
			.selectAll('text');

		const drawSections = () => {
			Object.keys(sections).forEach((section, i) => {
				const sectionData = sections[section];
				const yGap = 15 * i;

				//.range([height / 2, height])

				// Y axis
				const y = scaleBand()
					.range([(height * i) / 2, (height / 2) * (i + 1) - 30])
					.domain(sectionData.map((d) => d.label))
					.padding(0.4);

				svg.append('g').call(axisLeft(y)).attr('transform', `translate(0, ${yGap})`);

				svg
					.selectAll('myRect')
					.data(sectionData)
					.enter()
					.append('rect')
					.attr('x', x(0))
					.attr('y', function (d) {
						console.log({ d });
						return y(d.label);
					})
					.attr('width', function (d) {
						return x(d.data);
					})
					.attr('height', y.bandwidth())
					.attr('fill', uvPollColors[i])
					.attr('stroke', 'black')
					.attr('stroke-width', '1px')
					.attr('transform', `translate(0, ${yGap})`)
					.attr('rx', 3);
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
				<svg ref={ref} style={{ border: '1px solid black', overflow: 'visible' }} />
			</div>
		</>
	);
};

export default RefreshedResults;
