import { dispatch } from "@designcombo/events";
import { ADD_AUDIO, ADD_IMAGE, ADD_VIDEO, ADD_ITEMS } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import React, { useCallback, useState } from "react";

enum AcceptedDropTypes {
	IMAGE = "image",
	VIDEO = "video",
	AUDIO = "audio",
}

interface DraggedData {
	type: AcceptedDropTypes;
	[key: string]: any;
}

interface DroppableAreaProps {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	onDragStateChange?: (isDragging: boolean) => void;
	id?: string;
}

const parseDraggedDataFromTypes = (dt: DataTransfer): DraggedData | null => {
	console.log("🔍 parseDraggedDataFromTypes - dataTransfer types:", Array.from(dt.types));
	console.log("🔍 parseDraggedDataFromTypes - AcceptedDropTypes:", Object.values(AcceptedDropTypes));
	
	for (const t of Array.from(dt.types)) {
		try {
			const maybe = JSON.parse(t);
			console.log("🔍 parseDraggedDataFromTypes - parsed type:", maybe);
			console.log("🔍 parseDraggedDataFromTypes - maybe.type:", maybe?.type);
			console.log("🔍 parseDraggedDataFromTypes - includes check:", Object.values(AcceptedDropTypes).includes(maybe?.type));
			
			if (
				maybe &&
				typeof maybe === "object" &&
				Object.values(AcceptedDropTypes).includes(maybe.type)
			) {
				const payloadStr = dt.getData(t);
				const payload = JSON.parse(payloadStr);
				console.log("🔍 parseDraggedDataFromTypes - final payload:", payload);
				return payload;
			}
		} catch (error) {
			console.log("🔍 parseDraggedDataFromTypes - error parsing type:", error);
		}
	}
	console.log("🔍 parseDraggedDataFromTypes - no valid data found");
	return null;
};

const useDragAndDrop = (onDragStateChange?: (isDragging: boolean) => void) => {
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	const handleDrop = useCallback((draggedData: DraggedData) => {
		console.log("🔍 handleDrop - received draggedData:", draggedData);
		const newId = generateId();
		switch (draggedData.type) {
			case AcceptedDropTypes.IMAGE: {
				console.log("🔍 handleDrop - processing IMAGE type");
				const src = draggedData?.details?.src;
				if (!src) {
					console.log("🔍 handleDrop - no src found in draggedData");
					return;
				}
				console.log("🔍 handleDrop - dispatching ADD_IMAGE with src:", src);
				dispatch(ADD_IMAGE, {
					payload: {
						id: newId,
						details: { src },
						metadata: { previewUrl: draggedData?.metadata?.previewUrl },
					},
					options: {
						resourceId: "image",
						scaleMode: "fit",
					},
				});
				break;
			}
			case AcceptedDropTypes.VIDEO:
				console.log("🔍 handleDrop - processing VIDEO type");
				dispatch(ADD_VIDEO, { 
					payload: { ...draggedData, id: newId },
					options: {
						resourceId: "main",
						scaleMode: "fit",
					},
				});
				break;
			case AcceptedDropTypes.AUDIO:
				console.log("🔍 handleDrop - processing AUDIO type");
				dispatch(ADD_AUDIO, { 
					payload: { ...draggedData, id: newId },
					options: {},
				});
				break;
			default:
				console.log("🔍 handleDrop - unknown type:", draggedData.type);
		}
	}, []);

	const onDragEnter = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			try {
				const draggedData = parseDraggedDataFromTypes(e.dataTransfer);
				if (!draggedData) return;
				if (!Object.values(AcceptedDropTypes).includes(draggedData.type)) return;
				setIsDraggingOver(true);
				setIsPointerInside(true);
				onDragStateChange?.(true);
			} catch (error) {
				console.error("Error parsing dragged data:", error);
			}
		},
		[onDragStateChange],
	);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			if (isPointerInside) {
				setIsDraggingOver(true);
				onDragStateChange?.(true);
			}
		},
		[isPointerInside, onDragStateChange],
	);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!isDraggingOver) return;
			e.preventDefault();
			setIsDraggingOver(false);
			onDragStateChange?.(false);

			try {
				const draggedData = parseDraggedDataFromTypes(e.dataTransfer);
				if (!draggedData) return;
				handleDrop(draggedData);
			} catch (error) {
				console.error("Error parsing dropped data:", error);
			}
		},
		[isDraggingOver, onDragStateChange, handleDrop],
	);

	const onDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			if (!e.currentTarget.contains(e.relatedTarget as Node)) {
				setIsDraggingOver(false);
				setIsPointerInside(false);
				onDragStateChange?.(false);
			}
		},
		[onDragStateChange],
	);

	return { onDragEnter, onDragOver, onDrop, onDragLeave, isDraggingOver };
};

export const DroppableArea: React.FC<DroppableAreaProps> = ({
	children,
	className,
	style,
	onDragStateChange,
	id,
}) => {
	const { onDragEnter, onDragOver, onDrop, onDragLeave } =
		useDragAndDrop(onDragStateChange);

	return (
		<div
			id={id}
			onDragEnter={onDragEnter}
			onDrop={onDrop}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			className={className}
			style={style}
			role="region"
			aria-label="Droppable area for images, videos, and audio"
		>
			{children}
		</div>
	);
};
