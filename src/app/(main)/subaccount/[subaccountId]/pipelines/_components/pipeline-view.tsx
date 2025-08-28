'use client'
import LaneForm from '@/components/forms/lane-from'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { LaneDetail, PipelineDetailsWithLanesCardsTagsTickets, TicketAndTags } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { Lane, Ticket } from '@prisma/client'
import { Flag, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {DragDropContext,DropResult , Droppable} from "@hello-pangea/dnd";
import PipelineLane from './pipeline-lane'

type Props = {
  lanes: LaneDetail[]
  pipelineId: string
  subaccountId: string
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
  updateLanesOrder: (lanes: Lane[]) => Promise<void>
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>
}

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const {setOpen} = useModal()
  const router = useRouter()
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([])

  useEffect(() => {
    setAllLanes(lanes)
  },[lanes])

  const ticketsFromAllLanes: TicketAndTags[] = []
  lanes.forEach((item) => {
    item.Tickets.forEach((i) => {
      ticketsFromAllLanes.push(i)
    })
  })
  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes)

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title = "Create a Lane"
        subheading='Lanes allow you to group tickets'
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    )
  }

  const onDragEnd = (dropResult: DropResult) => {
    console.log(dropResult)
    const {destination, source, type} = dropResult
    if(!destination || (destination.droppableId === source.droppableId && destination.index === source.index)){
      return
    }

    switch(type){
      case 'lane': {
        const newLanes = [...allLanes].toSpliced(source.index,1).toSpliced(destination.index,0,allLanes[source.index]).map((lane,idx) => {
          return {...lane, order: idx}
        })

        setAllLanes(newLanes)
        updateLanesOrder(newLanes)
        break;
      }

      case 'ticket': {
  let newLanes = [...allLanes];
  const originLane = newLanes.find(lane => lane.id === source.droppableId);
  const destinationLane = newLanes.find(lane => lane.id === destination.droppableId);

  if (!originLane || !destinationLane) return;

  const [movedTicket] = originLane.Tickets.splice(source.index, 1);

  // Update origin orders
  originLane.Tickets.forEach((ticket, idx) => {
    ticket.order = idx;
  });

  // Insert in new lane
  destinationLane.Tickets.splice(destination.index, 0, {
    ...movedTicket,
    laneId: destination.droppableId,
  });

  // Update destination orders
  destinationLane.Tickets.forEach((ticket, idx) => {
    ticket.order = idx;
  });

  // Save lane state
  setAllLanes(newLanes);

  // VERY IMPORTANT: Sync allTickets from updated lanes
  const newAllTickets = newLanes.flatMap((lane) => lane.Tickets);
  setAllTickets(newAllTickets);

  // Optional: persist order change
  updateTicketsOrder([...originLane.Tickets, ...destinationLane.Tickets]);

  break;
}
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in border-none no-scrollbar'>
        <div className='flex items-center justify-between border-none no-scrollbar'>
          <h1 className='text-2xl'>{pipelineDetails?.name}</h1>
          <Button
            className=''
            onClick={handleAddLane}
          >
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <Droppable
        droppableId='lanes'
        type="lane"
        direction="horizontal"
        key="lanes"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className='flex items-center gap-x-2 overflow-auto'
          >
            <div className='flex gap-2 mt-4'>
              {allLanes.map((lane, index) => {
              const laneTickets = allTickets
  .filter((ticket) => ticket.laneId === lane.id.toString())
  .sort((a, b) => a.order - b.order);


              return (
                <PipelineLane
                  key={lane.id}
                  index={index}
                  allTickets={allTickets}
                  setAllTickets={setAllTickets}
                  tickets={laneTickets}
                  pipelineId={pipelineId}
                  laneDetails={lane}
                  subaccountId={subaccountId}
                />
              );
            })}

            {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

        {allLanes.length == 0 && (
          <div className='flex items-center justify-center w-full flex-col'>
            <div className='opacity-100'>
              <Flag
                width="100%"
                height="100%"
                className='text-muted-foreground'
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default PipelineView