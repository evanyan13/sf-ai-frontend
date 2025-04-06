"use client"
import { Card, CardContent } from '@/components/ui/card';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';

export default function ProfileNode({ data }) {
    const { type, name } = data;

    const getBgColor = () => {
        switch (type) {
            case 'individual':
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
            <Handle type="target" position={Position.Top} />
            <div>
                <Card className="w-full max-w-xs rounded-xl overflow-hidden shadow-xl">
                    {/* Top Section with Background */}
                    <div className={`h-18 ${getBgColor()}`}></div>

                    {/* Profile Picture - Positioned to overlap the background */}
                    <div className="flex justify-center -mt-12">
                        <div className="relative w-24 h-24 border-4 border-white rounded-full overflow-hidden">
                            <Image
                                src={`/profile-${type}.png`}
                                alt="Profile picture"
                                width={96}
                                height={96}
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <CardContent className="pt-4 pb-6 text-center">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold inline-flex items-center gap-2">
                                {name}
                            </h2>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Handle type="source" position={Position.Bottom} id="a" />
            <Handle type="source" position={Position.Bottom} id="b" />
        </>
    );
}