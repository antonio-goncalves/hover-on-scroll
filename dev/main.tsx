import "./main.css"
import {useEffect, useRef} from "react";
import HoverOnScroll from "../src/HoverOnScroll";

export const Main = function(){

    const ref = useRef<HTMLDivElement>(null)

    useEffect(()=>{
        let hoverOnScroll: HoverOnScroll | undefined
        if(ref.current){
            hoverOnScroll = new HoverOnScroll([
                {
                    hoverClass:"hover",
                    elementClass:"square",
                    scrollingElements:[ref.current]
                }
            ])
        }

        return ()=>{
            hoverOnScroll?.destroy()
        }
    },[ref])


    function renderSquares(className:string = ""){
        const squares = []
        for(let i=0;i<10;i++){
            squares.push(<div key={i} className={`square ${className}`} />)
        }

        return squares
    }

    function renderScrollArea(manual?:boolean){
        return (
            <div className={"scroll-area"} ref={ref}>
                {renderSquares(manual?"manual-hover":"")}
            </div>
        )
    }

    function renderInfo(){
        return null
    }

    function renderScrollAreas(){
        return (
            <div className={"scroll-areas"}>
                {renderScrollArea()}
                {renderScrollArea(true)}
            </div>
        )
    }

    return (
        <div>
            {renderInfo()}
            {renderScrollAreas()}
        </div>
    )
}