import { createRoot, type Root } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { useCurrentZone, type ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'

const styles = {
    container: {
        padding: 16,
        color: 'var(--text, #eee)',
        fontSize: 12,
    },
    flex: {
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 11,
        color: 'var(--text-dim, #888)',
        margin: 0,
    },
    card: {
        marginTop: 16,
        padding: 12,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 6,
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
        color: 'var(--text-dim, #888)',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text, #eee)',
        textAlign: 'right' as const,
    },
}

function Section({ label, value }: { label: string; value: string; }): JSX.Element {
    return (
        <div style={styles.card}>
            <div style={styles.flex}>
                <div style={styles.cardLabel}>{label}</div>
                <div style={styles.cardValue}>{value}</div>
            </div>
        </div>
    )
}

function Hideout({ isHideout }: { isHideout: boolean; }): JSX.Element {
    const hideoutStyle = {
        ...styles.cardValue,
        color: isHideout ? 'var(--match)' : 'var(--danger)',
    }

    return (
        <div style={styles.card}>
            <div style={styles.flex}>
                <div style={styles.cardLabel}>Hideout</div>
                <div style={hideoutStyle}>{isHideout ? 'Yes' : 'No'}</div>
            </div>
        </div>
    )
}

function parseMapName(code: string | undefined): string {
    if (!code) return '(No zone data yet)'

    if (!code.startsWith('MapWorlds')) return '(Not in map)'

    const map = code
        .replace('MapWorlds', '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .trim()

    return map
}

function isHideoutSpawned(ctx: ScalpelPluginContext): boolean {
    const [isHideout, setIsHideout] = useState<boolean>(false)

    useEffect(() => {
        const unsubscribe = ctx.onLogLine((line: string) => {
            if (line.includes('Generating level')) {
                setIsHideout(false)
                return
            }
            
            if (line.includes('Spawning discoverable Hideout')) {
                setIsHideout(true)
            }
        })
        return () => {
            unsubscribe()
        }
    }, [ctx])

    return isHideout
}

function HideoutHunterOverlay({ ctx }: { ctx: ScalpelPluginContext }): JSX.Element {
    const zone = useCurrentZone()
    const isHideout = isHideoutSpawned(ctx)

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Hideout Hunter</h2>
                <p style={styles.subtitle}>Detecting discoverable hideouts</p>
            </div>
            <Section label='Map' value={parseMapName(zone?.areaCode)} />
            <Hideout isHideout={isHideout} />
        </div>
    )
}

let root: Root | null = null

export default function activate(ctx: ScalpelPluginContext): void {
    ctx.registerOverlay(
        {
            title: 'Hideout Hunter',
            hotkeyLabel: 'Toggle Hideout Hunter window',
            defaultSize: { width: 250, height: 176 },
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
