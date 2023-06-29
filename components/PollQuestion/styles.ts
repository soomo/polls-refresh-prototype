import { css } from '@emotion/core';

import { mixins, breakpoints } from '@soomo/lib/styles/themes';

export const pollResultsStyles = (theme) => {
	return css`
		padding: 30px;
		margin: 30px 0;
		background-color: #fff;
		display: flex;
		flex-wrap: wrap;

		@media (max-width: ${breakpoints.small}) {
			padding: 20px 7px;
			margin: 10px 0;
			display: inline-flex;
			flex-wrap: wrap;
		}

		.sr-only {
			${mixins.webtextHiddenAccessible(theme)}
		}

		svg {
			// max-width: 300px;
			//min-height: 600px;
			flex-shrink: 0;
			//margin: auto;

			@media (max-width: ${breakpoints.small}) {
				margin: 1em auto;
			}
		}

		hr {
			border: thin solid black;
		}

		.total-responses {
			text-align: right;
		}

		.legend {
			margin: auto;
			max-width: 300px;
			min-width: 246px;

			.results-table {
				caption {
					display: block;
					@-moz-document url-prefix() {
						width: 100%;
						display: table-caption;
					}
				}
			}

			.legend-row {
				width: 100%;
				display: flex;
				justify-content: space-between;
				font-size: 0.875em;
				.response-label {
					text-align: left;
					font-weight: normal;
					display: flex;
					margin-right: 32px;
					.color {
						margin-top: 4px;
						margin-right: 8px;
						border-style: solid;
						border-width: 2px;
						flex-shrink: 0;
						width: 14px;
						height: 14px;
					}
				}
			}
		}

		.axis {
			font-size: 14px;

			.tick:last-of-type {
				text {
					text-anchor: end;
				}
			}

			.tick:first-of-type {
				text {
					text-anchor: start;
				}
			}
		}
	`;
};

export default (theme) => {
	return css`
		.loading {
			display: flex;
			span {
				margin-left: 0.5em;
			}
		}

		.submissionError {
			margin-top: 1em;
		}

		.status-and-actions {
			margin-top: 2em;
		}
	`;
};
