import type { NextApiHandler } from 'next';

export interface SavePollResponse {
	graph_data: { label: string; data: number }[];
}

const handler: NextApiHandler<SavePollResponse> = (req, res) => {
	if (req.method === 'POST') {
		res.status(200).json({
			graph_data: [
				{
					label: 'Issue 1',
					data: 10
				},
				{
					label: 'Issue 2',
					data: 20
				},
				{
					label: 'Issue 5',
					data: 15
				}
			]
		});
	}
};

export default handler;
