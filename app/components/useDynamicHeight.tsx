import {useState, useCallback, useLayoutEffect, useEffect, RefObject} from 'react'
import debounce from 'lodash.debounce'

interface UseDynamicHeightProps {
    contentRef: RefObject<HTMLElement | null>
    maxHeightOverride?: number
    staticOffsets?: number
    visibility: boolean
    dependency: any
}

export const useDynamicHeight = ({contentRef, dependency, visibility, staticOffsets = 280, maxHeightOverride}: UseDynamicHeightProps) => {
    const [height, setHeight] = useState<number>(0)

    const measureHeight = useCallback(() => {
        if (!contentRef.current) return

        if (!dependency || (Array.isArray(dependency) && dependency.length === 0)) {
        setHeight(0)
        return
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const node = contentRef.current
            if (!node) return

            const scrollHeight = node.scrollHeight
            const windowHeight = window.innerHeight
            const availableHeight = windowHeight - staticOffsets

            let nextHeight = Math.min(
                scrollHeight,
                Math.max(200, availableHeight - 5)
            )

            if (maxHeightOverride) {
                nextHeight = Math.min(scrollHeight, maxHeightOverride)
            }

            setHeight(nextHeight)
        })
    })}, [dependency, staticOffsets, maxHeightOverride, contentRef])

    useLayoutEffect(() => {
        measureHeight()
    }, [dependency, visibility, measureHeight])

    useEffect(() => {
        if (!visibility) {
            setHeight(0)
        }
    }, [visibility])

    useEffect(() => {
        const debouncedMeasure = debounce(measureHeight, 150)
        
        if (visibility) {
            measureHeight()
            window.addEventListener('resize', debouncedMeasure)
        }

        return () => {
            debouncedMeasure.cancel()
            window.removeEventListener('resize', debouncedMeasure)
        }
    }, [visibility, measureHeight])

  return {height, measureHeight}
}