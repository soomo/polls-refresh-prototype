import React, { useCallback, useEffect, useState } from 'react';
import { schemeCategory10, schemePastel2 } from 'd3-scale-chromatic';
import { arc, pie } from 'd3-shape';
import { darken } from 'polished';

import { useIsUniversalVelvet } from '@soomo/lib/hooks';

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

const PollResults: React.FC<Props> = (props) => {
	const { data: graphData } = props;
	const outerRadius = 80;
	const opacity = 1;
	const strokeWidth = 0.5;
	const d3Arc = arc();
	const isUniversalVelvet = useIsUniversalVelvet();
	const colors = isUniversalVelvet ? uvPollColors : schemeCategory10;

	// due to a bug in iOS Safari + VoiceOver, the poll results table can be reached even when
	// a soomo-libs/Modal is open, even though its parent has the inert attribute.
	// we have to manually set visibility: hidden when a modal is open to hide the poll results table;
	// we can detect whether a modal is open or closed by using a MutationObserver on the *direct*
	// children of <body> and seeing an the added or removed node has aria-modal="true".
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [mutationObserver, setMutationObserver] = useState<MutationObserver | null>(null);
	const mutationObserverCallback = useCallback((mutationRecords: MutationRecord[]) => {
		for (const record of mutationRecords) {
			for (let i = 0; i < record.addedNodes.length; i++) {
				const node = record.addedNodes[i];
				if (node instanceof HTMLElement && node.getAttribute('aria-modal') === 'true') {
					setIsModalOpen(true);
					break;
				}
			}
			for (let i = 0; i < record.removedNodes.length; i++) {
				const node = record.removedNodes[i];
				if (node instanceof HTMLElement && node.getAttribute('aria-modal') === 'true') {
					setIsModalOpen(false);
					break;
				}
			}
		}
	}, []);

	useEffect(() => {
		setMutationObserver(new MutationObserver(mutationObserverCallback));
	}, [mutationObserverCallback]);

	useEffect(() => {
		mutationObserver?.observe(window.document.body, { childList: true, subtree: false });
		return () => mutationObserver?.disconnect();
	}, [mutationObserver]);

	if (!graphData) {
		return <p>No answer</p>;
	}
	let totalResponseCount = 0;
	const pieData = graphData.map((d) => {
		totalResponseCount += d.data;
		return d.data;
	});

	const arcs = pie()(pieData).map((arcData, idx) => (
		<path
			key={idx}
			d={d3Arc({ ...arcData, innerRadius: 0, outerRadius: outerRadius })}
			fill={colors[idx % 10]}
			stroke="white"
			strokeWidth={strokeWidth}
			fillOpacity={opacity}
			transform={`translate(${outerRadius + 43},${outerRadius + 23})`}
		/>
	));

	/**
	 * Make sure a number is always returned.  We cannot divide by zero.
	 */
	const percent = (count, total) => {
		if (count === 0 && total === 0) {
			return 0;
		}
		return Math.round((count / total) * 100.0);
	};

	const labelFontSize = 13;
	const labels = pie()(pieData).map((arcData, idx) => {
		const pct = percent(arcData.data, totalResponseCount);
		if (pct < 5) return null;
		const labelText = `${pct}%`;
		const pos = d3Arc.centroid({
			startAngle: arcData.startAngle,
			endAngle: arcData.endAngle,
			outerRadius: outerRadius + 25,
			innerRadius: outerRadius + 15
		});
		const x = pos[0] + outerRadius + 43;
		const y = pos[1] + outerRadius + 33;

		return (
			<text key={idx} x={x} y={y} textAnchor="middle" fontSize={labelFontSize} fill="#333">
				{labelText}
			</text>
		);
	});

	// Leave room for labels outside
	const width = outerRadius * 2 + 86;
	const height = outerRadius * 2 + 86;

	/**
	 * Show empty pie chart when there are no responses
	 */
	const hasNoResponses = pieData.every((i) => i === 0);
	const EmptyPie: React.FC = () => (
		<path
			key={'empty-pie'}
			d={d3Arc({
				innerRadius: 0,
				outerRadius: outerRadius,
				startAngle: 0,
				endAngle: Math.PI * 2
			})}
			fill={schemePastel2[7]}
			stroke="white"
			strokeWidth={strokeWidth}
			fillOpacity={opacity}
			transform={`translate(${outerRadius + 43},${outerRadius + 23})`}
		/>
	);

	return (
		<>
			<div
				className="poll-results"
				css={pollResultsStyles}
				style={{ visibility: isModalOpen ? 'hidden' : undefined }}>
				<svg width={width} height={height} aria-hidden>
					{hasNoResponses ? <EmptyPie /> : arcs}
					{labels}
				</svg>
				<div className="legend">
					<div className="results-table" role="table" aria-label="Poll Responses">
						<caption>Poll Responses</caption>
						<div className="sr-only" role="row">
							<div role="columnheader">Responses</div>
							<div role="columnheader">Number of Responses</div>
							<div role="columnheader">Percentage of Responses</div>
						</div>
						{graphData.map((e, i) => (
							<div key={i} className="legend-row" role="row">
								<span className="response-label" role="rowheader">
									<div
										className="color"
										aria-hidden
										style={{
											backgroundColor: colors[i % 10],
											borderColor: darken(0.05, colors[i % 10])
										}}
									/>
									{e.label}
								</span>
								<span role="cell">{e.data}</span>
								<span role="cell" className="sr-only">
									{percent(e.data, totalResponseCount) + '%'}
								</span>
							</div>
						))}
					</div>
					<hr aria-hidden />
					<div className="total-responses">Total responses: {totalResponseCount}</div>
				</div>
			</div>
		</>
	);
};

export default PollResults;
