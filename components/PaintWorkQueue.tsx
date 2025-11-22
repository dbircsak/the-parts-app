"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PaintQueueCard from "./PaintQueueCard";
import AvailableCarCard from "./AvailableCarCard";
import DroppableZone from "./DroppableZone";
import Button from "./Button";
import Card from "./Card";

interface QueuedCar {
    roNumber: number;
    owner: string;
    vehicle: string;
    bodyTechnician: string;
    estimator: string;
    status: "NOT_STARTED" | "UNDERWAY" | "COMPLETED";
    priority: number;
}

interface AvailableCar {
    roNumber: number;
    owner: string;
    vehicle: string;
    bodyTechnician: string;
    estimator: string;
}

export default function PaintWorkQueue({
    queuedCars,
    availableCars: initialAvailableCars,
    allTechnicians = [],
    isGuest = false,
}: {
    queuedCars: QueuedCar[];
    availableCars: AvailableCar[];
    allTechnicians?: string[];
    isGuest?: boolean;
}) {
    const [cars, setCars] = useState(queuedCars);
    const [availableCars, setAvailableCars] = useState(initialAvailableCars);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    // Organize by status
    const byStatus = useMemo(() => {
        return {
            NOT_STARTED: cars
                .filter((c) => c.status === "NOT_STARTED")
                .sort((a, b) => a.priority - b.priority),
            UNDERWAY: cars
                .filter((c) => c.status === "UNDERWAY")
                .sort((a, b) => a.priority - b.priority),
            COMPLETED: cars
                .filter((c) => c.status === "COMPLETED")
                .sort((a, b) => a.priority - b.priority),
        };
    }, [cars]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        const draggedCar = cars.find((c) => c.roNumber === active.id);
        if (!draggedCar) return;

        // If dropped outside any zone, delete the car
        if (!over) {
            await deleteCarFromQueue(draggedCar.roNumber);
            return;
        }

        // Map the over id to status - handle both direct status ids and items in status containers
        let newStatus: "NOT_STARTED" | "UNDERWAY" | "COMPLETED" | null = null;

        if (over.id === "NOT_STARTED" || over.id === "UNDERWAY" || over.id === "COMPLETED") {
            newStatus = over.id;
        } else {
            // Check if the over item is in a specific container
            const overCar = cars.find((c) => c.roNumber === over.id);
            if (overCar) {
                newStatus = overCar.status;
            }
        }

        if (!newStatus || newStatus === draggedCar.status) return;

        // Optimistically update UI
        const updatedCars = cars.map((c) =>
            c.roNumber === draggedCar.roNumber ? { ...c, status: newStatus } : c
        );
        setCars(updatedCars);

        // Update on server
        try {
            const response = await fetch(`/api/work-queue/${draggedCar.roNumber}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                // Revert on error
                setCars(cars);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            // Revert on error
            setCars(cars);
        }
    };

    const deleteCarFromQueue = async (roNumber: number) => {
        try {
            const response = await fetch(`/api/work-queue/${roNumber}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Find the car being removed
                const carToRemove = cars.find((c) => c.roNumber === roNumber);

                // Remove from queue
                setCars((prevCars) => prevCars.filter((c) => c.roNumber !== roNumber));

                // Add back to available cars
                if (carToRemove) {
                    setAvailableCars((prevAvailable) => [
                        ...prevAvailable,
                        {
                            roNumber: carToRemove.roNumber,
                            owner: carToRemove.owner,
                            vehicle: carToRemove.vehicle,
                            bodyTechnician: carToRemove.bodyTechnician,
                            estimator: carToRemove.estimator,
                        },
                    ]);
                }
            } else {
                alert("Failed to remove car from queue");
            }
        } catch (error) {
            console.error("Error deleting car:", error);
            alert("Error removing car from queue");
        }
    };

    const addCarToQueue = async (car: AvailableCar) => {
        try {
            const response = await fetch("/api/work-queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roNumber: car.roNumber,
                    departmentCode: "P",
                    status: "NOT_STARTED",
                    priority: byStatus.NOT_STARTED.length,
                }),
            });

            if (response.ok) {
                // Add car to local state
                setCars((prevCars) => [
                    ...prevCars,
                    {
                        roNumber: car.roNumber,
                        owner: car.owner,
                        vehicle: car.vehicle,
                        bodyTechnician: car.bodyTechnician,
                        estimator: car.estimator,
                        status: "NOT_STARTED" as const,
                        priority: byStatus.NOT_STARTED.length,
                    },
                ]);
                // Remove from available cars
                setAvailableCars((prevAvailable) =>
                    prevAvailable.filter((c) => c.roNumber !== car.roNumber)
                );
            } else {
                alert("Failed to add car to queue");
            }
        } catch (error) {
            console.error("Error adding car:", error);
            alert("Error adding car to queue");
        }
    };

    const stats = {
        total: cars.length,
        notStarted: byStatus.NOT_STARTED.length,
        underway: byStatus.UNDERWAY.length,
        completed: byStatus.COMPLETED.length,
        available: availableCars.length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-l-4 border-orange-500">
                    <p className="text-gray-600 text-sm font-medium">Available to Add</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.available}</p>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm font-medium">Total in Queue</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </Card>
                <Card className="border-l-4 border-gray-400">
                    <p className="text-gray-600 text-sm font-medium">Not Started</p>
                    <p className="text-3xl font-bold text-gray-600">{stats.notStarted}</p>
                </Card>
                <Card className="border-l-4 border-yellow-400">
                    <p className="text-gray-600 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.underway}</p>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </Card>
            </div>

            {/* Work Queue Status Sections */}
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Not Started Section */}
                    <Card>
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 -m-4 mb-4 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Not Started</h2>
                                <span className="bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {stats.notStarted}
                                </span>
                            </div>
                        </div>
                        <SortableContext
                            items={byStatus.NOT_STARTED.map((c) => c.roNumber)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DroppableZone
                                id="NOT_STARTED"
                                className="p-6 min-h-96 bg-gray-50 rounded-lg"
                            >
                                {byStatus.NOT_STARTED.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No cars waiting to paint</p>
                                ) : (
                                    <div className="space-y-3">
                                        {byStatus.NOT_STARTED.map((car, idx) => (
                                            <div key={car.roNumber} className="flex items-start gap-3">
                                                <div className="bg-gray-300 text-gray-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <PaintQueueCard car={car} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DroppableZone>
                        </SortableContext>
                    </Card>

                    {/* In Progress Section */}
                    <Card>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 -m-4 mb-4 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">In Progress</h2>
                                <span className="bg-yellow-700 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {stats.underway}
                                </span>
                            </div>
                        </div>
                        <SortableContext
                            items={byStatus.UNDERWAY.map((c) => c.roNumber)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DroppableZone
                                id="UNDERWAY"
                                className="p-6 min-h-96 bg-yellow-50 rounded-lg"
                            >
                                {byStatus.UNDERWAY.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No cars currently being painted</p>
                                ) : (
                                    <div className="space-y-3">
                                        {byStatus.UNDERWAY.map((car, idx) => (
                                            <div key={car.roNumber} className="flex items-start gap-3">
                                                <div className="bg-yellow-300 text-yellow-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <PaintQueueCard car={car} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DroppableZone>
                        </SortableContext>
                    </Card>

                    {/* Completed Section */}
                    <Card>
                        <div className="bg-gradient-to-r from-green-600 to-green-700 -m-4 mb-4 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Completed</h2>
                                <span className="bg-green-800 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {stats.completed}
                                </span>
                            </div>
                        </div>
                        <SortableContext
                            items={byStatus.COMPLETED.map((c) => c.roNumber)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DroppableZone
                                id="COMPLETED"
                                className="p-6 min-h-96 bg-green-50 rounded-lg"
                            >
                                {byStatus.COMPLETED.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No completed paint jobs</p>
                                ) : (
                                    <div className="space-y-3">
                                        {byStatus.COMPLETED.map((car, idx) => (
                                            <div key={car.roNumber} className="flex items-start gap-3">
                                                <div className="bg-green-300 text-green-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <PaintQueueCard car={car} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DroppableZone>
                        </SortableContext>
                    </Card>
                </div>
            </DndContext>

            {/* Available Cars Section */}
            {allTechnicians.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Available Cars</h2>
                    {allTechnicians.map((technician) => {
                        const technicianCars = availableCars.filter(
                            (car) => car.bodyTechnician === technician
                        );
                        return (
                            <Card key={technician}>
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 -m-4 mb-4 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">{technician}</h3>
                                        <span className="bg-purple-800 text-white text-sm font-bold px-3 py-1 rounded-full">
                                            {technicianCars.length}
                                        </span>
                                    </div>
                                </div>
                                {technicianCars.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No available cars</p>
                                ) : (
                                    <div className="space-y-3">
                                        {technicianCars.map((car, idx) => (
                                            <div key={car.roNumber} className="flex items-start gap-3">
                                                <div className="bg-purple-300 text-purple-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 flex items-start gap-2">
                                                    <AvailableCarCard car={car} />
                                                    {!isGuest && (
                                                        <Button
                                                            onClick={() => addCarToQueue(car)}
                                                            variant="success"
                                                            size="sm"
                                                            className="mt-2 flex items-center gap-2 whitespace-nowrap"
                                                            title="Add car to Not Started queue"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
