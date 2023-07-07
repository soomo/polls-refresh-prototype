import React from 'react';

import { css } from '@emotion/core';

const shapedData = [
	['Class', 'Texas', 'United States'],
	[35, 40, 80],
	[15, 50, 20],
	[30, 10, 10],
	[60, 20, 27],
	[15, 50, 20],
	[0, 0, 0]
];

const sourceComments = [
	'“Source Title One” Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor     incididunt ut labore et dolore magna. February 2014',
	'“Source Title 2”  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. February 2021'
];

const PollData: React.FC = () => {
	const datasets = shapedData[0];

	const formatDataset = (dataset: string) => {
		return dataset.replace('United States', 'U.S.');
	};

	return (
		<div css={pollDataStyles}>
			<div className="poll-data-container">
				<table>
					<thead>
						<tr>
							<th>Responses</th>
							{datasets.map((dataset) => (
								<th key={dataset} colSpan={2}>
									{formatDataset(dataset)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								Issue 1: Efforts to reduce turnover of CPS caseworkers fail to address key reasons
								many staff leave.
							</td>
							<td>30</td>
							<td>15%</td>
							<td>160</td>
							<td>32%</td>
							<td>2100</td>
							<td>35%</td>
						</tr>
						<tr>
							<td>
								Issue 2: A crisis culture affects CPS’ ability to focus on day-to-day management
								activities needed to successfully perform its difficult work.
							</td>
							<td>30</td>
							<td>15%</td>
							<td>160</td>
							<td>32%</td>
							<td>2100</td>
							<td>35%</td>
						</tr>
						<tr>
							<td>
								Issue 5: CPS does not capture comprehensive information to adequately assess how
								well it is protecting children.
							</td>
							<td>30</td>
							<td>15%</td>
							<td>160</td>
							<td>32%</td>
							<td>2100</td>
							<td>35%</td>
						</tr>
					</tbody>
				</table>
				{sourceComments.map((comment) => (
					<p className="poll-data-comment">{comment}</p>
				))}
				<p className="poll-data-comment">
					Respondents were asked, “What is your annual household income?” The table represents the
					total number of peer responses and their responses to average annual income.
				</p>
			</div>
		</div>
	);
};

export default PollData;

export const pollDataStyles = () => {
	return css`
		.poll-data-container {
			padding: 1em;

			display: flex;
			flex-direction: column;
			gap: 1em;
		}

		.poll-data-comment {
			margin-left: 1em;

			::before {
				counter-increment: .poll-data-comment;
				content: counter(.poll-data-comment) '.';
			}
		}

		table,
		th,
		td {
			border: 1px solid #b3b3b3;
			border-collapse: collapse;
		}

		th:first-of-type {
			//text-align: left;
		}

		td {
			padding: 4px 10px;
			vertical-align: top;
		}
	`;
};
