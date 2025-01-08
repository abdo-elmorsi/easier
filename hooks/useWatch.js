import { useEffect, useRef } from 'react'
// watch deps if only deps had changes , and skip the first time
export default function useWatch(callback, deps) {
    const isFirstRender = useRef(true)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return;
        }
        callback();
    }, deps)
}