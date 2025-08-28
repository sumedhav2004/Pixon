import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/db';
import { getLanesWithTicketAndTags, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from '@/lib/queries';
import { LaneDetail } from '@/lib/types';
import { redirect } from 'next/navigation';
import React from 'react'
import PipeLineInfoBar from '../_components/pipeline-infobar';
import PipelineSettings from '../_components/pipeline-settings';
import PipelineView from '../_components/pipeline-view';

type Props = {
  params: {subaccountId: string; pipelineId: string}
}

const PipeLinePage = async ({params}: Props) => {
  const subAccountId = params.subaccountId;
  const pipelineId = params.pipelineId;
  const pipeLineDetails = await getPipelineDetails(params.pipelineId)

  if(!pipeLineDetails) return redirect(`/subaccount/${params.subaccountId}/pipelines`)

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: params.subaccountId},
  }) || [];
  console.log("Pipelines: ",pipelines);

  const lanes = (await getLanesWithTicketAndTags(
    pipelineId
  )) as LaneDetail[] || []
  console.log("Lanes: ",lanes);


  return (
    <Tabs defaultValue='view' className='w-full'>
      <TabsList className='bg-transparent border-b-2 h-16 w-full justify-between mb-4'>
        <PipeLineInfoBar pipelineId={params.pipelineId} subAccountId={params.subaccountId} pipelines={pipelines} />
        <div>
        <TabsTrigger value="view" >
          Pipeline View
        </TabsTrigger>
        <TabsTrigger value='settings' >
          Settings
        </TabsTrigger>
      </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipeLineDetails}
          pipelineId={params.pipelineId}
          subaccountId={params.subaccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings 
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          subaccountId={params.subaccountId}
        />
      </TabsContent>
    </Tabs>
  )
}

export default PipeLinePage
