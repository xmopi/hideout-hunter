import { createRoot, type Root } from 'react-dom/client'
import { useEffect } from 'react'
import { prettyAreaName } from './lib/area-name'
import {
    useCurrentZone,
    type ScalpelPluginContext,
} from '@scalpelpoe/plugin-sdk'

function Section({ label, value }: { label: string; value: string; }) {
    return (
        <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted, rgba(255,255,255,0.55))' }}>
                {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text, white)' }}>{value}</div>
        </div>
    )
}

function Hideout({ value }: { value: boolean; }) {
    return (
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted, rgba(255,255,255,0.55))' }}>
                HIDEOUT
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: value ? 'var(--match)' : 'var(--danger)' }}>{value ? 'Yes' : 'No'}</div>
        </div>
    )
}

let hideout = false

function HideoutHunterOverlay({ ctx }: { ctx: ScalpelPluginContext }): JSX.Element {
    const zone = useCurrentZone()

    useEffect(() => {
        const logLine = ctx.onLogLine((line) => {
            if (line.match(/Generating level (\d+) area "([^"]+)"/)) hideout = false
            if (line.includes('Spawning discoverable Hideout')) hideout = true
        })
    
        return () => {
            logLine()
        }
    }, [ctx])

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 8,
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
            }}
        >
            <Section label='Map' value={prettyAreaName(zone?.areaCode ?? '(No zone data yet)')} />
            <Hideout value={hideout} />
        </div>
    )
}

let root: Root | null = null

export default function activate(ctx: ScalpelPluginContext): void {
    ctx.registerOverlay(
        {
            title: 'Hideout Hunter',
            hotkeyLabel: 'Toggle Hideout Hunter window',
            defaultSize: { width: 330, height: 110 },
        },
        (container) => {
            root = createRoot(container)
            root.render(<HideoutHunterOverlay ctx={ctx} />)
            return () => {
                root?.unmount()
                root = null
            }
        },
    )
}