'use client'
import { useEditor } from '@/providers/editor/editor-provider'
import React from 'react'
import TabList from './tabs'
import SettingsTab from './tabs/settings-tab'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import MediaBucketTab from './tabs/media-bucket-tab'
import ComponentsTab from './tabs/components-tab'

type Props = {
  subaccountId: string
}

const FunnelEditorSidebar = ({subaccountId}: Props) => {
  console.log('FunnelEditorSidebar rendering');
  const {state, dispatch} = useEditor()
  
  console.log('Preview mode:', state.editor.previewMode)
  console.log('Selected element:', state.editor.selectedElement)
  
  if (state.editor.previewMode) return null
  
  return (
    <Tabs className='w-full' defaultValue='Settings'>
      {/* Tab List - Exact Sheet styling */}
      <div className="fixed top-[97px] right-0 w-16 h-[calc(100vh-97px)] z-[80] shadow-none p-0 bg-background border-l border-border">
        <TabList />
      </div>
      
      {/* Main Content - Exact Sheet styling */}
      <div className="fixed top-[97px] right-16 w-80 h-[calc(100vh-97px)] z-[40] shadow-none p-0 bg-background border-l border-border">
        <div className='grid gap-4 h-full pb-36 overflow-y-scroll no-scrollbar'>
          
          <TabsContent value="Settings">
            {/* Exact SheetHeader recreation */}
            <div className="flex flex-col space-y-2 text-left p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Styles</h3>
              <p className="text-sm text-muted-foreground">
                Show your creativity! You can customize every component as you like.
              </p>
            </div>
            <SettingsTab />
          </TabsContent>
          
          <TabsContent value="Components">
            <div className="flex flex-col space-y-2 text-left p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Components</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop components on the canvas
              </p>
            </div>
            <div className="p-6">Components content</div>
          </TabsContent>
          
          <TabsContent value="Layers">
            <div className="flex flex-col space-y-2 text-left p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Layers</h3>
              <p className="text-sm text-muted-foreground">
                View the component layers
              </p>
            </div>
            <div className="p-6">Layers content</div>
          </TabsContent>
          
          <TabsContent value="Media">
            <div className="flex flex-col space-y-2 text-left p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Media</h3>
              <p className="text-sm text-muted-foreground">
                Upload and manage media files
              </p>
            </div>
            <MediaBucketTab subaccountId={subaccountId} />
          </TabsContent>
          <TabsContent value="Components">
            <div className="flex flex-col space-y-2 text-left p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Components</h3>
              <p className="text-sm text-muted-foreground">
                You can drag and drop components
              </p>
            </div>
            <ComponentsTab />
          </TabsContent>
          
        </div>
      </div>
    </Tabs>
  )
}

export default FunnelEditorSidebar
