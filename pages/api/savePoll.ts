import sqrQuestionPools from '../../fixtures/sqrQuestionPools';

import type { NextApiHandler } from 'next';

export interface SavePollResponse {
	graph_data: { label: string; data: number }[];
}

const handler: NextApiHandler<SavePollResponse> = (req, res) => {
	if (req.method === 'POST') {
		const { choice_family_id: choiceFamilyId } = JSON.parse(req.body);

		res.status(200).json({
			graph_data: [
				{
					label: 'a',
					data: 0
				},
				{
					label: 'bc',
					data: 1
				},
				{
					label: 'cc',
					data: 0
				}
			]
		});
	}
};

export default handler;
