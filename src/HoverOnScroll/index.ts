

interface MousePosition {
    x:number,
    y:number
}

const DEFAULT_MOUSE_POSITION:MousePosition = {
    x:0,
    y:0
}
interface ElementToHover {
    elementClass:string,
    hoverClass:string,
    scrollingElements?:Element[]
}

interface Options {
    initialMousePosition?:MousePosition,
    scrollOffset?:number,
    mouseOffset?:number
}

interface ElementAndIndex {
    element:Element,
    index:number
}
function isTouchDevice() {

    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}

export default class HoverOnScroll {

    constructor(elementsToHover:ElementToHover[],options?:Options) {
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onScroll = this.onScroll.bind(this)
        this.waitForAnimation = this.waitForAnimation.bind(this)
        this.setHover = this.setHover.bind(this)
        this.onClick = this.onClick.bind(this)


        this.scrollOffset = options?.scrollOffset || 0
        this.mouseOffset = options?.mouseOffset || 0;
        this.mousePosition = options?.initialMousePosition || {x:0,y:this.mouseOffset}
        this.elementsToHover = elementsToHover
        this.activeElement = null;
        this.ticking = false;
        this.isTouchDevice = isTouchDevice()
        if(!this.isTouchDevice){
            addEventListener("mousemove",this.onMouseMove)
            addEventListener("scroll",this.onScroll)
            for(const scrollingElement of this.getAllScrollingElements()){
                scrollingElement.addEventListener("scroll",this.onScroll)
            }
        }else{
            this.addTouchEvents()
            addEventListener("click",this.onClick)
        }
    }
    getAllScrollingElements():Element[]{
        return this.elementsToHover.filter(e=>e.scrollingElements).reduce((a,e)=>[...a,...e.scrollingElements],[])
    }
    private mousePosition:MousePosition
    private elementsToHover:ElementToHover[]
    private activeElement:ElementAndIndex | null
    private ticking:boolean
    private isTouchDevice:boolean
    private scrollOffset: number
    private mouseOffset:number
    onClick(e:MouseEvent){
        if(e.target instanceof Element){
            if(!this.getElement(e.target)){
                this.activeElement?.element.classList.remove(this.getActiveElementHoverClass())
                this.activeElement = null;
            }
        }

    }


    addTouchEvents(){
        for(let i=0;i<this.elementsToHover.length;i++){
            const elementToHover = this.elementsToHover[i]
            const elements = Array.from(document.getElementsByClassName(elementToHover.elementClass))
            for(const element of elements){
                if(!(element instanceof  HTMLElement)) return
                element.onclick = ()=>{
                    const isSame = this.activeElement?.element.isSameNode(element)
                    if(!isSame){
                        this.activeElement?.element.classList.remove(this.getActiveElementHoverClass())
                    }
                    this.activeElement = {index:i,element}
                    if(element.classList.contains(elementToHover.hoverClass)){
                        element.classList.remove(elementToHover.hoverClass)

                    }else {
                        element.classList.add(elementToHover.hoverClass)
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - this.scrollOffset;
                        window.scroll({top:offsetPosition})
                    }

                }
            }
        }
    }

    removeTouchEvents(){
        for(const elementToHover of this.elementsToHover) {
            const elements = Array.from(document.getElementsByClassName(elementToHover.elementClass))
            for (const element of elements) {
                if (!(element instanceof HTMLElement)) return
                element.onclick = null
            }
        }
    }

    destroy(){
        if(this.activeElement){
            this.activeElement.element.classList.remove(this.getActiveElementHoverClass())
        }

        if(!this.isTouchDevice){
            removeEventListener("mousemove",this.onMouseMove)
            removeEventListener("scroll",this.onScroll)
            for(const scrollingElement of this.getAllScrollingElements()){
                scrollingElement.removeEventListener("scroll",this.onScroll)
            }
        }else{
            this.removeTouchEvents()
            addEventListener("click",this.onClick)
        }



    }

    getActiveElementHoverClass():string {
        if(this.activeElement){
            return this.elementsToHover[this.activeElement.index].hoverClass
        }
        return ""
    }
    onMouseMove(e:MouseEvent){
        this.mousePosition.x = e.clientX
        this.mousePosition.y = e.clientY<this.mouseOffset?this.mouseOffset:e.clientY

        this.waitForAnimation(this.setHover)


        //store.dispatch(setPosition({x:e.clientX,y:e.clientY}))
    }

    waitForAnimation(callback:()=>void){
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                callback()
                this.ticking = false;
            });

            this.ticking = true;
        }
    }

    onScroll(_e:Event){
        this.waitForAnimation(this.setHover)
    }
    setHover(){
        const {x,y} = this.mousePosition
        const el = this.getElement(document.elementFromPoint(x,y))
        const activeHoverClassName:string = this.getActiveElementHoverClass()
        if(!el && this.activeElement){
            this.activeElement.element.classList.remove(activeHoverClassName)
        }
        if(el){
            let isSame = false
            if(this.activeElement){
                isSame = el.element.isSameNode(this.activeElement.element)
                if(!isSame){
                    this.activeElement.element.classList.remove(activeHoverClassName)
                }
            }
            const newHover = this.elementsToHover[el.index].hoverClass
            el.element.classList.add(newHover)

        }
        this.activeElement = el

    }
    getElement(element:Element | null): ElementAndIndex | null{
        if(!element){
            return null
        }
        const index = this.elementsToHover.findIndex(el=>element.classList.contains(el.elementClass))
        if(index>=0){
            return {element,index}
        }
        return this.getElement(element.parentElement)
    }
}