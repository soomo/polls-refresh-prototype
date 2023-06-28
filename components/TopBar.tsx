import { css } from '@emotion/core';

const TopBar: React.FC = ({ children }) => <header css={styles}>{children}</header>;
export default TopBar;

const styles = css`
	position: sticky;
	top: 0;
	z-index: 1;
	background: #ece9e9;
	height: 52px;
	display: flex;
	align-items: center;
	padding-left: 8rem;
	border-bottom: 1px solid #bebebe;

	h1 {
		font-size: 20px;
		font-weight: 600;
	}

	button {
		display: flex;
		padding: 0.5rem 0.75rem;
		border: 2px solid;
		border-radius: 6px;
		font: inherit;
		font-size: 16px;
		line-height: 18px;
		font-weight: 500;
		cursor: pointer;

		&:disabled {
			border-color: #585858;
			color: #585858;
		}

		&:not(:disabled) {
			background: #5f01df;
			border-color: transparent;
			color: #fff;
		}

		&:focus {
			outline-width: 2px;
			outline-style: solid;
			outline-offset: 2px;
		}
	}
`;
