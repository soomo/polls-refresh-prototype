import React, { useCallback, useState } from 'react';
import { css } from '@emotion/core';

const TabsContext = React.createContext<{
	selectedTab: string | null;
	selectTab: (tab: string) => void;
	tabsPrefix: string;
}>({
	tabsPrefix: '',
	selectedTab: null,
	selectTab: (tab: string) => {
		throw new Error('should not be used without TabsContext.Provider');
	}
});

interface TabsProps {
	children: React.ReactNode;
	defaultSelectedTab: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultSelectedTab }) => {
	const tabsPrefix = React.useMemo(() => {
		// use some unique id generator
		// return uid()
		return 'tabxxx';
	}, []);

	const [selectedTab, selectTab] = useState(defaultSelectedTab);

	const contextValue = React.useMemo(
		() => ({
			selectTab,
			selectedTab,
			tabsPrefix
		}),
		[selectedTab, selectTab, tabsPrefix]
	);

	return (
		<TabsContext.Provider value={contextValue}>
			<div css={tabStyles}>{children}</div>
		</TabsContext.Provider>
	);
};

interface TabListProps {
	children: React.ReactNode;
	'aria-label': string;
}

export const TabList: React.FC<TabListProps> = ({ children, 'aria-label': ariaLabel }) => {
	const refList = React.useRef<HTMLDivElement>(null);

	const onKeyDown = useCallback((e: React.KeyboardEvent) => {
		const list = refList.current;
		if (!list) return;
		const tabs = Array.from<HTMLElement>(list.querySelectorAll('[role="tab"]:not([diabled])'));
		const index = tabs.indexOf(document.activeElement as HTMLElement);
		if (index < 0) return;

		switch (e.key) {
			case 'ArrowUp':
			case 'ArrowLeft': {
				const next = (index - 1 + tabs.length) % tabs.length;
				tabs[next]?.focus();
				break;
			}
			case 'ArrowDown':
			case 'ArrowRight': {
				const next = (index + 1 + tabs.length) % tabs.length;
				tabs[next]?.focus();
				break;
			}
		}
	}, []);
	return (
		<div
			className="soomo-tablist"
			ref={refList}
			role="tablist"
			aria-label={ariaLabel}
			onKeyDown={onKeyDown}>
			{children}
		</div>
	);
};

interface TabProps {
	children: React.ReactNode;
	tab: string;
}

export const Tab: React.FC<TabProps> = ({ children, tab }) => {
	const { selectedTab, selectTab, tabsPrefix } = React.useContext(TabsContext);

	return (
		<button
			className="soomo-tab"
			role="tab"
			aria-selected={selectedTab === tab}
			aria-controls={`tab-${tabsPrefix}-tabpanel-${tab}`}
			onClick={() => selectTab(tab)}
			tabIndex={selectedTab === tab ? 0 : -1}
			style={{ fontWeight: selectedTab === tab ? 'bold' : 'normal' }}>
			{children}
		</button>
	);
};

interface TabPanelProps {
	children: React.ReactNode;
	tab: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, tab }) => {
	const { selectedTab, tabsPrefix } = React.useContext(TabsContext);

	if (selectedTab !== tab) return null;

	return (
		<div
			className="soomo-tabpanel"
			role="tabpanel"
			tabIndex={0}
			id={`tab-${tabsPrefix}-tabpanel-${tab}`}>
			{children}
		</div>
	);
};

export const tabStyles = () => {
	return css`
		.soomo-tab {
			font-size: 12px;
			padding: 8px 24px;
			background: white;
			border: 1px solid #b3b3b3;
			border-bottom: none;
            width: 80px;
		}

		.soomo-tablist {
			display: flex;
			flex-direction: row;
			gap: 4px;
		}

		.soomo-tabpanel {
			background: white;
            border: 1px solid #b3b3b3;
            border-top: 0;
		}
	`;
};
