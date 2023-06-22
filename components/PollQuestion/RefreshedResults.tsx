import React, { useCallback, useEffect, useRef, useState } from 'react';
import { schemeCategory10, schemePastel2 } from 'd3-scale-chromatic';
import { arc, pie } from 'd3-shape';
import { darken } from 'polished';
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

interface Props {
	data: Array<{
		label: string;
		data: number;
	}>;
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
	const { data: graphData } = props;
	const isUniversalVelvet = useIsUniversalVelvet();
	const colors = isUniversalVelvet ? uvPollColors : schemeCategory10;
	const chartData = graphData.map((row) => [row.label, row.data]);

	const ref = useRef();

	const margin = { top: 20, right: 30, bottom: 40, left: 90 };
	const width = 460 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;
	const color: any = scaleOrdinal().range(20);
	const pattern: any = scaleOrdinal().range(20);

	const seriesLabels = chartData.shift().slice(1);
	let categories: any = transpose(chartData);
	const categoryLabels: Array<any> = categories.shift();
	categories = transpose(categories).map((row) =>
		row.map((value: any) => {
			return valueOf(value);
		})
	);

	const groupsScale = scaleBand().domain(categoryLabels);
	const seriesScale = scaleBand().domain(seriesLabels);
	const valuesScale = scaleLinear();
	const valueType = categories[0][0].type;
	const formatValue = getFormat(valueType);

	const viewBoxWidth = 700;
	const viewBoxHeight = 400;

	const svg = select(ref.current)
		.attr('class', 'chart')
		.attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.append('g');

	const drawGroupedChart = ({
		svg,
		categories,
		color,
		pattern,
		transform,
		x,
		y,
		width,
		height,
		labelX,
		labelY,
		labelDX,
		labelDY,
		format
	}) => {
		console.log('draw it');

		const group = svg
			.selectAll('.groups')
			.data(categories)
			.enter()
			.append('g')
			.attr('class', 'g')
			.attr('transform', transform);

		const horizontalGrouped = group
			.selectAll('rect')
			.data((d: any) => d)
			.enter()
			.append('rect')
			.attr('x', x)
			.attr('y', y)
			.attr('width', width)
			.attr('height', height);

		horizontalGrouped.style('fill', (d, i) => color(i)).style('stroke', (d, i) => color(i));

		group
			.selectAll('text')
			.data((d: any) => d)
			.enter()
			.append('text')
			.attr('class', 'label')
			.attr('x', labelX)
			.attr('y', labelY)
			.attr('dx', labelDX)
			.attr('dy', labelDY)
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle')
			.text((d: any) => format(d.value));
	};

	useEffect(() => {
		let categories: any = transpose(chartData);
		const categoryLabels: Array<any> = categories.shift();
		categories = transpose(categories).map((row) =>
			row.map((value: any) => {
				return valueOf(value);
			})
		);

		console.log({ categories, categoryLabels });

		drawGroupedChart({
			svg,
			categories,
			color,
			pattern,
			transform: (d, i) => `translate(0, ${groupsScale(categoryLabels[i])})`,
			x: (d: any) => (d.value < 0 ? -Math.abs(valuesScale(d.value) - valuesScale(0)) : 0),
			y: (d, i) => seriesScale(seriesLabels[i]),
			width: (d: any) =>
				d.value < 0 ? Math.abs(valuesScale(d.value) - valuesScale(0)) : valuesScale(d.value),
			height: seriesScale.bandwidth(),
			labelX: (d: any) => valuesScale(d.value) + 3,
			labelY: (d, i) => seriesScale(seriesLabels[i]),
			labelDX: '1.1em',
			labelDY: seriesScale.bandwidth() / 2,
			format: formatValue
		});
	}, []);

	if (!graphData) {
		return <p>No answer</p>;
	}

	return (
		<>
			<div className="poll-results" css={pollResultsStyles}>
				<QuestionPrompt body={'Poll Responses'} />
				<p>Compare the results below with your class, the state of Texas, and the United States.</p>
				<svg ref={ref} />
			</div>
		</>
	);
};

export default RefreshedResults;
