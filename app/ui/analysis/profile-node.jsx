"use client"
import { Card, CardContent } from '@/components/ui/card';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';

export default function ProfileNode({ data }) {
    const { type, name } = data;

    const getBgColor = () => {
        switch (type) {
            case 'person':
                return 'bg-blue-400';
            case 'company':
                return 'bg-green-400';
            case 'state':
                return 'bg-red-400';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <>
            <div style={{ minWidth: '220px' }}>
                <Card className="w-full max-w-xs rounded-xl overflow-hidden shadow-xl">
                    {/* Top Section with Background */}
                    <div className={`h-18 ${getBgColor()}`}></div>

                    {/* Profile Picture - Positioned to overlap the background */}
                    <div className="flex justify-center -mt-12">
                        <div className="relative w-24 h-24 border-4 border-white rounded-full overflow-hidden bg-white flex items-center justify-center">
                            <Image
                                src={`/profile-${type}.png`}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <CardContent className="pt-4 pb-6 text-center">
                        <div className="mb-6 flex flex-col items-center">
                            <h2 className="text-xl font-semibold inline-flex items-center gap-2">
                                {name}
                            </h2>
                            <span className={`px-3 py-1 inline-block rounded-full text-white font-bold ${getBgColor()}`}>{type}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Handle type="target" position={Position.Top} id="top-target" />
            <Handle type="source" position={Position.Top} id="top-source" />

            <Handle type="target" position={Position.Right} id="right-target" />
            <Handle type="source" position={Position.Right} id="right-source" />

            <Handle type="target" position={Position.Bottom} id="bottom-target" />
            <Handle type="source" position={Position.Bottom} id="bottom-source" />

            <Handle type="target" position={Position.Left} id="left-target" />
            <Handle type="source" position={Position.Left} id="left-source" />
        </>
    );
}