'use client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import CustomModal from '@/components/global/custom-modal'
import CheckCircle from '@/components/icons/check_circled'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CreateFunnelFormSchema } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import { Pipeline } from '@prisma/client'
import { ChevronsUpDown, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  subAccountId: string
  pipelines: Pipeline[]
  pipelineId: string
}

const PipeLineInfoBar = ({subAccountId, pipelines, pipelineId}: Props) => {
  const { setOpen: setOpenModal, setClose} = useModal()
  const [open, setOpen] = React.useState(false)

  const [value,setValue] = React.useState(pipelineId)

  const handleClickCreatePipeline = () => {
    setOpenModal(
      <CustomModal
        title="Create A Pipeline"
        subheading="Pipelines allows you to group tickets into lanes and track your business processes all in one place."
      >
        <CreatePipelineForm subaccountId={subAccountId} />
      </CustomModal>
    )
  }


  return (
    <div>
      <div className='flex items-end gap-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant = "outline"
              role="combobox"
              aria-expanded = {open}
              className = "w-[200px] justify-between"
            >
              {value 
              ? pipelines && pipelines.find((pipeline) => pipeline.id === value)?.name : "Select a pipeline..."}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[200px] p-0">
            <Command label="Pipelines">
      {/* 1. The search/input field */}

      {/* 2. Everything that can appear in the “dropdown” list: */}
      <CommandList>
        {/* If no pipelines exist (or filter yields no results), show this: */}
        <CommandEmpty>No pipelines found.</CommandEmpty>

        {/* Group heading (optional) */}
        <CommandGroup heading="Existing Pipelines">
          {/*
            3. Map over your pipelines. 
            - We use `CommandItem asChild` so that cmdk treats the <Link> itself as the clickable item.
            - The Link’s href goes to `/subaccount/${subAccountId}/pipelines/${pipeline.id}`.
            - onSelect just closes the popover & sets the value.
          */}
          {pipelines?.map((pipeline) => (
            <CommandItem
              key={pipeline.id}
              value={pipeline.id}
              onSelect={(currentValue) => {
                setValue(currentValue);
                setOpen(false);
              }}
              asChild
            >
              <Link href={`/subaccount/${subAccountId}/pipelines/${pipeline.id}`}>
                {/* The Link—rendered as the actual <li> in cmdk’s internals */}
                {pipeline.name}
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* A separator if you want “Create Pipeline” visually separated */}
        <CommandSeparator />

        {/* 4. “Create Pipeline” becomes a CommandItem too. */}
        <CommandGroup>
          <CommandItem
            value="__create_pipeline"
            onSelect={() => {
              // close + call your create-pipeline handler
              setOpen(false);
              handleClickCreatePipeline();
            }}
          >
            <Plus size={15} className="mr-2" />
            Create Pipeline
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
          </PopoverContent>

        </Popover>
      </div>
      
    </div>
  )
}

export default PipeLineInfoBar
