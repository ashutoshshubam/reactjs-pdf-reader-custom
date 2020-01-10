import * as React from "react";
import * as CSSModules from "react-css-modules";
import * as styles from "./index.less";
import * as pdfjsLib from "pdfjs-dist";
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.550/pdf.worker.js";
// the default params
const DEFAULT_DESIRE_WIDTH = 980;
const DEFAULT_SCALE = 1;
// const DEFAULT_MIN_SCALE=0.25;
// const DEFAULT_MAX_SCALE=10;
interface urlTypes {
    url: string;
    withCredentials?: boolean,
    maxImageSize?: number,
    cMapPacked?: boolean
}
interface IProps {
    url?: string|urlTypes;
    data?: string;
    scale?: string|number;
    page?: number;
    showAllPage?: boolean;
    onDocumentComplete?: any;
    getPageNumber?: any;
    pageScroll?:number;
    width?: number;
    commentCount?:number;
    closeCount?:number;
    messageCount?:number;
    checkCount?:number;
    imgPath?:string;
    conversationIcon?:string;
    tickIcon?:string;
    documentIcon?:string;
    crossIcon?: string;
    isShowFooter?: boolean
}
interface IStates {
    pdf: any;
    page: number;
    style: object;
    totalPage: number;
    commentCount:number;
    closeCount?:number;
    messageCount?:number;
    checkCount?:number;
    imgPath?:string;
    conversationIcon?:string;
    tickIcon?:string;
    documentIcon?:string;
    crossIcon?: string;
    isShowFooter?: boolean
}
export class PDFReader extends React.Component<IProps, IStates> {
    state: IStates = {
        pdf: null,
        style: null,
        page: 1,
        totalPage: 0,
        commentCount :0 ,
        closeCount:0,
        messageCount:0,
        checkCount:0,
        imgPath:null,
        conversationIcon:null,
        tickIcon:null,
        documentIcon:null,
        crossIcon: null,
        isShowFooter: false
    };
    canvas: any;
    public constructor(props: IProps) {
        super(props);
        this.canvas = React.createRef();
    }

    static getDerivedStateFromProps(props, state) {
        const {pageScroll, pdfDiv} = props;
        if (pdfDiv && (pageScroll || pageScroll === 0)) {
            var elmnt = document.querySelector("#" + pdfDiv).querySelector("#my-pdf").querySelector("#div-pdf-" + pageScroll);
            if (elmnt) {
                elmnt.scrollIntoView();
            }
        }
        return {
            ...state, page: props.page, commentCount: props.commentCount, closeCount: props.closeCount,
            messageCount: props.closeCount, checkCount: props.checkCount, imgPath: props.imgPath,
            conversationIcon: props.conversationIcon, crossIcon: props.crossIcon, documentIcon: props.documentIcon,
            tickIcon: props.tickIcon, isShowFooter: props.isShowFooter
        };
    }

    public componentDidMount () {
        const { url, data, showAllPage, onDocumentComplete,getPageNumber,commentCount } = this.props;
        const dom: any = this.canvas.current;
        if (url) {
            let obj = {
                url: null
            };
// fetch pdf and render
            if (typeof url === "string") {
                obj.url = url;
            } else if (typeof url === "object") {
                obj = url;
            }
            pdfjsLib.getDocument(obj).then((pdf) => {
// is exit onDocumentComplete or not
                if(!showAllPage){
                    if (onDocumentComplete) {
                        this.props.onDocumentComplete(pdf.numPages);
                    }
                }
                this.setState( { totalPage: pdf.numPages });
                this.setState({ pdf }, () => {
                    if (showAllPage) {
                        this.renderAllPage();
                    } else {
                        this.renderPage(dom, null);
                    }
                });
            });
        } else {
// loaded the base64
            const loadingTask = pdfjsLib.getDocument({data});
            loadingTask.promise.then((pdf) => {
// is exit onDocumentComplete or not
                if(!showAllPage){
                    if (onDocumentComplete) {
                        this.props.onDocumentComplete(pdf.numPages);
                    }
                }
                this.setState({ pdf }, () => {
                    if (showAllPage) {
                        this.renderAllPage();
                    } else {
                        this.renderPage(dom, null);
                    }
                });
            });
        }
    }

// in the new lifestyle we can use this in shouldComponentUpdate
    public shouldComponentUpdate(nextProps, nextState) {
        const { pdf } = this.state;
        const { showAllPage } = nextProps;
        const dom = this.canvas.current;
        if (showAllPage)
            return true;
        if (nextProps.page !== this.state.page) {
            this.renderPage(dom, nextProps.page);
        }
        return true;
    }

    public render(): JSX.Element {
        const {style, totalPage} = this.state;
        const {
            showAllPage, commentCount, closeCount, messageCount, checkCount, page, imgPath,
            crossIcon, conversationIcon, documentIcon, tickIcon, isShowFooter
        } = this.props;
        let tempArr = new Array(totalPage);
        tempArr.fill(0);
        return (
            <div id="my-pdf" style={style} className={styles["pdf__container"]}>
                {
                    showAllPage ? <React.Fragment>
                            {
                                tempArr.map((item, i) => {
                                    var index = i + 1;
                                    return (
                                        <div className="react-pdf__Page"
                                             style={{position: "relative"}}
                                             data-page-number={index + ""} id={"div-pdf-" + index} key={"div-" + index}
                                             onClick={this.getCurrentPageNumber.bind(this, index)}>

                                            <canvas ref={(canvas) => {
                                                this["canvas" + index] = canvas;
                                            }} key={index + ""} id={"canvas-pdf-" + index} data-page={index + ""}
                                                    className={"canvaspdf"}>

                                            </canvas>
                                            {isShowFooter &&
                                            <div className="testing" style={{
                                                position: "absolute", bottom: "16px", width: "100%",
                                                textAlign: "center", borderRadius: 50, backgroundColor: "#ddd", opacity: 0.9
                                            }}>

                                                <h3><img src={conversationIcon}
                                                         style={{height: 20, width: 20}}/> {commentCount}
                                                    <img src={crossIcon} style={{height: 20, width: 20}}/> {closeCount} <img
                                                        src={documentIcon} style={{height: 20, width: 20}}/> {messageCount}
                                                    <img src={tickIcon} style={{height: 20, width: 20}}/> {checkCount} </h3>

                                            </div>}


                                        </div>);
                                })
                            }
                        </React.Fragment>
                        :
                        <canvas ref={this.canvas}/>
                }
            </div>
        );
    }

    private renderAllPage() {
        var self = this;
        const {pdf, totalPage} = this.state;
        const {width, scale, onDocumentComplete} = this.props;
        if (totalPage > 0) {
            let proArr = [];
            for (let i = 1; i <= totalPage; i++) {
                const dom = this["canvas" + i];
                proArr.push(this.renderPage(dom, i));
            }
            Promise.all(proArr).then(function (values) {
                if (onDocumentComplete) {
                    self.props.onDocumentComplete(pdf.numPages);
                }
            });
        }
    }

    private getCurrentPageNumber(page) {
        const {getPageNumber} = this.props;
        if (getPageNumber) {
            this.props.getPageNumber(page);
        }
    }

    private getPageScroll(page) {
        const {pageScroll} = this.props;
        console.log("page===>", page);
        if (pageScroll) {
            var elmnt = document.getElementById("div-pdf-" + page);
            elmnt.scrollIntoView();
        }
    }

    private renderPage(dom, spnum) {
        let self=this;
        return new Promise(function(resolve, reject) {
            const { pdf, page} = self.state;
            const { width, scale,showAllPage } = self.props;
            let currentPage = page || 1;
            if (spnum) {
                currentPage = spnum;
            }
            if (currentPage > pdf.numPages) {
                currentPage = pdf.numPages;
            }
            if (currentPage < 1) {
                currentPage = 1;
            }

            pdf.getPage(currentPage).then((page) => {
                let desiredWidth;
// if this.props has width props
                if (width) {
                    desiredWidth = width;
                } else {
                    desiredWidth = DEFAULT_DESIRE_WIDTH;
                }
                let desireScale;
// if this.props has scale props
                if (scale) {
                    desireScale = scale;
                } else {
                    let templeView = page.getViewport(DEFAULT_SCALE);
                    desireScale = desiredWidth / templeView.width;
                }
                const viewport = page.getViewport(desireScale);
                const canvas = dom;
                const canvasContext = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if(showAllPage){
                    self.setState({
                        style: {
                            height: 'auto',
                            width: canvas.width
                        }
                    });
                }else {
                    self.setState({
                        style: {
                            height: canvas.height,
                            width: canvas.width
                        }
                    });
                }
                const renderContext = {
                    canvasContext,
                    viewport
                };
                page.render(renderContext).promise.then(function(){
                    resolve(true);
                });
            });
        });
    }
}
