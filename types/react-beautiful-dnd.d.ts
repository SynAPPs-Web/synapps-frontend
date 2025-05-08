declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;

  export interface DraggableLocation {
    droppableId: DroppableId;
    index: number;
  }

  export interface DragResult {
    draggableId: DraggableId;
    type: string;
    source: DraggableLocation;
    destination: DraggableLocation | null;
    reason: 'DROP' | 'CANCEL';
  }

  export interface DraggableProvided {
    draggableProps: {
      style?: React.CSSProperties;
      [key: string]: any;
    };
    dragHandleProps: {
      [key: string]: any;
    } | null;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    placeholder?: React.ReactNode;
    droppableProps: {
      [key: string]: any;
    };
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver: DroppableId | null;
    dropAnimation: {
      duration: number;
      curve: string;
    } | null;
    dragHandleProps: {
      [key: string]: any;
    } | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: DraggableId | null;
    draggingFromThisWith: DraggableId | null;
    isUsingPlaceholder: boolean;
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DragResult) => void;
    onDragStart?: (initial: DragResult) => void;
    onDragUpdate?: (update: DragResult) => void;
    children: React.ReactNode;
  }

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: any) => React.ReactNode;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  }

  export class DragDropContext extends React.Component<DragDropContextProps> {}
  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
} 