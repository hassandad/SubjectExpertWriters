import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import axios from 'axios';

import Type from './Type'
var counter = 0;
var t = 0;
class AssignmentList extends Component {
    constructor() {
        super();
        this.state = {
            iconStar : false,
            orders : [],
            user: [],
            bids:[],
            next:'',
            prev: null,
            type : '1',
            amount: 0,
            amountFee:0,
            amountTotal:0,
            description : '',
            file:'',
            image:'',
            imageName:'',
            id:'',
            bid_id:'',
            auction:[],
            assignmentType:'',
            assignmentSubject:'',
            assignmentSubSubject:'',
            assignmentFormat:'',
            elligable:true,
            warning:'',
        }
        this.checkAmount = this.checkAmount.bind(this);
    this.getAssignment = this.getAssignment.bind(this);
    this.onBidTypeChange = this.onBidTypeChange.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.userSession = this.userSession.bind(this);
    this.getOrder = this.getOrder.bind(this);
    this.getOrder2 = this.getOrder2.bind(this);
    this.getBid = this.getBid.bind(this);

    }

    componentWillMount() {
        this.getAssignment();
        this.getBid();
        this.userSession();
    }

    componentDidMount() {
        $(ReactDOM.findDOMNode(this.refs.bidAmount)).hide();
        $(ReactDOM.findDOMNode(this.refs.bidAmountFee)).hide();
        $(ReactDOM.findDOMNode(this.refs.bidAmountTotal)).hide();

    }
    getOrder(id){
        axios.get('/api/assignment/single/'+id).then(res => {
           this.setState({
               auction : res.data[0]
           })

           axios.get('/api/assignment/getType/'+res.data[0].type_id).then(res => {
            if(res.status === 200){
                this.setState({
                    assignmentType: res.data[0].name,   
                });
            }
        });
        axios.get('/api/assignment/getSubject/'+res.data[0].subject_id).then(res => {
            if(res.status === 200){
                this.setState({
                    assignmentSubject: res.data[0].name,
                    assignmentSubSubject: res.data[0].subjectName,   
                });
            }
        });
        axios.get('/api/assignment/getFormat/'+res.data[0].format_id).then(res => {
            if(res.status === 200){
                this.setState({
                    assignmentFormat: res.data[0].name,   
                });
            }
        });
        })
       
    }
    getBid(){
        axios.get('/api/getBid').then(res => {
            if(res.status === 200){
                this.setState({
                    bids: res.data
                });
            }
        });
    }
    getAssignment(){
        axios.get('/api/assignment/all').then(res => {
            if(res.status === 200){
                this.setState({
                    orders: res.data.data,
                    next: res.data.next_page_url
                });
            }
        });
    }
    next(){
        axios.get(this.state.next).then(res => {
            if(res.status === 200){
                this.setState({
                    orders: res.data.data,
                    next: res.data.next_page_url,
                    prev: res.data.prev_page_url
                });
            }
        });
       
    }
    prev(){
        axios.get(this.state.prev).then(res => {
            if(res.status === 200){
                this.setState({
                    orders: res.data.data,
                    next: res.data.next_page_url,
                    prev: res.data.prev_page_url
                });
            }
        });
       
    }
    iconStarClick(){
        this.setState({
            iconStar : !this.state.iconStar
        })
    }
    userSession(){
        axios.get('/api/getSession').then(res => {
            this.setState({
                user : res.data
            })

        })
    }
    openDetailModal(id){
        this.getOrder(id);
                $(ReactDOM.findDOMNode(this.refs.detailModal)).modal('show')
    }
    openBidModal(id){
        this.getOrder2(id);
        this.setState({id : id});
        axios.get('/api/checkIfBidExists/'+this.state.user.id+'/'+id).then(res => {
            this.setState({bid_id : res.data[0].id,
                        type : res.data[0].type,
                        amount : res.data[0].amount,
                        description : res.data[0].message,
                        file : res.data[0].file});
            if(res.data[0].type === 2){
                $(ReactDOM.findDOMNode(this.refs.bidAmount)).show();
                $(ReactDOM.findDOMNode(this.refs.bidAmountFee)).show();
                $(ReactDOM.findDOMNode(this.refs.bidAmountTotal)).show();
                console.log(this.state.type);
            }
                $(ReactDOM.findDOMNode(this.refs.bidModal)).modal('show');
                
            
        });

    }
    onBidTypeChange(e){
        this.setState({
            type : e.target.value
        },() => {
            if(this.state.type === '2'){
                $(ReactDOM.findDOMNode(this.refs.bidAmount)).show();
                $(ReactDOM.findDOMNode(this.refs.bidAmountFee)).show();
                $(ReactDOM.findDOMNode(this.refs.bidAmountTotal)).show();
            }else if(this.state.type === '1'){
                this.setState({amount:'0',warning:'',elligable:true,amountFee:'0',amountTotal:'0'});
                $(ReactDOM.findDOMNode(this.refs.bidAmount)).hide();
                $(ReactDOM.findDOMNode(this.refs.bidAmountFee)).hide();
                $(ReactDOM.findDOMNode(this.refs.bidAmountTotal)).hide();
            }
        });
     }
     sendBid(){
 
         var _state = this.state;
         var post = new URLSearchParams();
         post.append('assignment_id', _state.bid_id);
         post.append('type', _state.type);
         post.append('message', _state.description);
         post.append('image', _state.image);
         post.append('imageName', _state.imageName);
         if(t !== ''){
            post.append('amount', t);
        }
         axios.post('/api/order/updateBid',post).then(res => {
           if(res.status === 200){
               if(res.data.hasOwnProperty('success')){
                   swal({
                       title: 'Success',
                       text : res.data.msg,
                       icon : 'success'
                   });
                   setTimeout(()=> {
                    window.location.reload();
                },1000);
                   $(ReactDOM.findDOMNode(this.refs.bidModal)).modal('hide')
                   this.setState({
                       type : '1',
                       amount: 0,
                       description : '',
                   });
               }
           }
         })
     }
     handleChangeImage(evt) {
         
         var self = this;
         var file = evt.target.files[0];
         var reader  = new FileReader();
         self.setState({imageName:file.name});
         reader.onload = function(upload) {
             self.setState({image: upload.target.result});
         };
         reader.readAsDataURL(file); 
     }
     addFile() {
        $(ReactDOM.findDOMNode(this.refs.fileselect)).click(); 
    }
    checkAmount(amount)
    {   var commision = Math.ceil((20*amount)/100);
        t= Math.round(parseInt(amount) + commision) ;
        if (isNaN(t)) {
            t=0;
        }
        if (this.state.auction[0].price < t) {
            this.setState({elligable: false,warning:"Amount Exceeded",amountFee:commision + '  Commission',amountTotal:t + '  Total Bid'});
        } else if (t <= 0) {
            this.setState({elligable: false,warning:"Amount Must Be Greater Than 0",amountFee:commision + '  Commission',amountTotal:t + '  Total Bid'});
        } else {
            this.setState({elligable: true,warning:'',amountFee:commision + '  Commission',amountTotal:t + '  Total Bid'});
        }
    }
    getOrder2(id){
        axios.get('/api/assignment/single/'+id).then(res => {
           this.setState({
               auction : res.data
           })
        })
       
    }
    render() {
        return (
            <div>
                {
                    this.state.orders.map((c,i) => {
                        return(
                    //         <div className="row">
                    //             <div className="col-md-12 cnt-cnt">
                    //                 <div className={'panel panel-flat'}>
                    //                     <div className={'panel-body'} style={styles.panelBody}>
                    //                         <div style={styles.titleBody}>
                    //                             <div style={styles.title}>
                    //                                 <i className={'icon-file-text2'}></i>
                    //                                 <span style={{paddingLeft: 20}}><h4 style={{color: 'dodgerblue'}}><a href={'/writer/dashboard/auction/'+data.orderId} target={'_blank'}>{data.title}</a></h4></span>
                    //                             </div>
                    //                             <i onClick={this.iconStarClick.bind(this)} className={this.state.iconStar ? 'icon-star-full2' : 'icon-star-empty3'}></i>
                    //                         </div>
                    //                         <div style={styles.otherDetails}>
                    //                             <div style={{paddingLeft: 35, fontWeight: 'bold'}}>{data.typeName}</div>
                    //                             <div style={{fontWeight: 'bold'}}>Budget ${data.price - 2}</div>
                    //                            <a href={'/writer/dashboard/auction/'+data.orderId}> <button className="btn btn-primary heading-btn  pull-right">Apply</button></a>
                    //                         </div>
                    //                     </div>
                    //                 </div>
                    //             </div>
                    //         </div>
                    
                        this.state.bids.map((v,index) => {
                            return(
                                v.assignment_id == c.id ?
                                
<div key={i}>
<div className="content-group-lg">
<div className="panel panel-flat"> 
    <div className="panel-body" style={{padding:0}}>
        <div className="col-md-12">
            <span style={{display:"block",fontSize: 15,padding:7, textTransform: "uppercase"}}><a style={{fontWeight: "bold"}} target="_blank" href={'/writer/dashboard/auction/'+c.id}>{c.topic}</a><Type typeId={c.type_id} subjectId={c.subject_id}/></span>
        
        </div>										
    </div>
<div className="panel panel-flat">
    <div className="panel-heading" style={{marginTop:0,marginBottom:-15}}>
        <span ><span type="button" className="btn-info btn-rounded" style={{padding: 7}}><i className="icon-calendar"></i></span><span style={{marginLeft: 10 , color: "#8c8c8c",textTransform: "uppercase"}}>Added {c.created_on}</span></span>
        <span style={{marginLeft: 25}}><span type="button" className="btn-danger btn-rounded" style={{padding: 7}}><i className="icon-calendar"></i></span><span style={{marginLeft: 10 , color: "#8c8c8c", fontWeight: "bold",textTransform: "uppercase"}}>Deadline {c.deadline}</span>
        <button type="button" style={{float: "right",backgroundColor:'#08498c',marginTop:-7}} onClick={this.openBidModal.bind(this,c.id)} className="btn btn-primary btn-rounded btn-xs legitRipple">Bid Placed</button>
        <button type="button" style={{float: "right", marginRight:10,marginTop:-7,backgroundColor:"#1eceab"}} onClick={this.openDetailModal.bind(this,c.id)} className="btn btn-success btn-rounded btn-xs legitRipple">Read More</button>
        </span>
    
    </div>
</div>
</div>
</div>
<hr style={{marginTop: -10,
    marginBottom:10,
    border: 0,
    borderTop:"2px solid #00bcd4"}}></hr>
</div>
:
<div></div>
  )
})
                        )
                    })
                }
                 {this.state.prev == null ?  <button onClick={this.prev.bind(this)} className="btn btn-primary btn-rounded heading-btn  pull-left" disabled="disabled">Previous</button> 
                :  <button onClick={this.prev.bind(this)} className="btn btn-primary btn-rounded heading-btn  pull-left">Previous</button>}
                {this.state.next == null ?  <button onClick={this.next.bind(this)} className="btn btn-primary btn-rounded heading-btn  pull-right" disabled="disabled">Next</button> 
                :  <button onClick={this.next.bind(this)} className="btn btn-primary btn-rounded heading-btn  pull-right">Next</button>}
               

               <div ref={'bidModal'} className="modal fade" id="myModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                    <div className="modal-content">
                <div className="modal-header">
                    <div style={styles.headerUser}>
                        <div>
                            <img style={styles.avatar} src={'/user.png'}/>
                            <strong>{this.state.user.username}</strong>
                        </div>
                       <div>
                             <span style={{color: '#000', fontWeight: 'bold' ,textTransform: "uppercase"}}>{this.state.warning}</span>
                        </div>
                        <div style={styles.headerUser}>
                        {this.state.file == '' ? <div></div>
                        : <a href={"/file/"+this.state.file} download> <button type="button" title="File"  className="btn border-info text-info-600 btn-flat btn-icon btn-rounded">
                        <i className="icon-file-text2"></i>
                                </button></a>
                          }
                            <select onChange={(e) => this.onBidTypeChange(e)} className={'form-control'}>
                                <option value='2'>BID</option>
                                <option value='1'>NEGOTIABLE</option>
                            </select>
                            <input type="number"  ref={'bidAmount'} value={this.state.amount} onChange={(e) => {this.setState({amount:e.target.value}); this.checkAmount(e.target.value)}} className={'form-control'} placeholder={'Bid Amount'}/>
                        </div>
                    </div>
                </div>
                <div className="modal-body">
                <div className="form-group">
            <div className="col-md-6">
            <input ref={'bidAmountFee'} value={this.state.amountFee} className={'form-control'} placeholder={'Commission'}/>
            </div>
            <div className="col-md-6">
            <input ref={'bidAmountTotal'} value={this.state.amountTotal} className={'form-control'} placeholder={'Total'}/>
            </div>
            </div>
                    <textarea className={'form-control'} value={this.state.description} onChange={(e) => this.setState({description : e.target.value})}></textarea>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-primary btn-rounded pull-left" onClick={this.addFile.bind(this)}>ADD File</button>
                <input type="file" className="file-styled-primary"  ref={'fileselect'} style={{display: 'none'}} onChange={this.handleChangeImage} />
                    <button type="button" className="btn btn-secondary btn-rounded" data-dismiss="modal">Cancel</button>
                    {this.state.elligable ? <button type="button" className="btn btn-primary  btn-rounded" onClick={this.sendBid.bind(this)}>Update Bid</button>
                    : <button type="button" className="btn btn-primary  btn-rounded" disabled="disabled" >Update Bid</button>}
                </div>
                </div>
                    </div>
                </div>




                <div ref={'detailModal'} className="modal fade" id="myModal"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" style={{width:1000}}>
                    <div className="modal-content">
   
                <div className="modal-body">
                <div className="panel panel-flat">
                    <div className="panel-body">
                        <div className="tabbable">
                            <ul className="nav nav-tabs nav-tabs-highlight">
                                <li className="active"><h4 style={{textTransform: "uppercase"}}>{this.state.auction.topic}</h4></li>
                            </ul>
                            <div className="tab-content">
                                <div className="tab-pane active" id="badges-tab1">
                                    <div className="col-md-12"><h5 style={{textTransform: "uppercase"}}>Description</h5></div>
                                    <div className="table-responsive col-md-6">
                                        <table className="table table-bordered table-striped table-hover bg-info-100">
                                            <tbody>
                                            <tr><td><i className=" icon-sort-time-asc" /></td>
                                                <td style={{textTransform: "uppercase"}}>Deadline:</td>
                                                <td><span style={{color: '#e60000',textTransform: "uppercase"}}>{this.state.auction.deadline}</span></td></tr>
                                            <tr><td><i className="icon-price-tag" /></td>
                                                <td style={{textTransform: "uppercase"}}>Customer Budget:</td>
                                                <td><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>${this.state.auction.price}   You get ${Math.round(this.state.auction.price - Math.ceil((20*this.state.auction.price)/100))}</span></td></tr>
                                            <tr><td><i className="icon-box" /></td>
                                                <td style={{textTransform: "uppercase"}}>Subject</td><td><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>{this.state.assignmentSubject}  {this.state.assignmentSubSubject}</span></td>
                                            </tr>
                                            <tr><td><i className="icon-bookmark" /></td>
                                                <td style={{textTransform: "uppercase"}}>Paper Type:</td>
                                                <td><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>{this.state.assignmentType}</span></td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="media-list">
                                            <li className="media">
                                                <a href="#" className="media-left"><img src="/user.png" className="img-circle img-md" alt /></a>
                                                <div className="media-body">
                                                    <a href="#" className="media-heading text-semibold text-default">{this.state.auction.name}</a>
                                                    <span className="text-size-small text-muted display-block" style={{textTransform: "uppercase"}}> Assignment Added on: <span style={{fontWeight: 'bold' ,textTransform: "uppercase"}}>{this.state.auction.created_on}</span></span>
                                                </div>
                                                <div className="media-right media-middle">
                                                    <ul className="icons-list text-nowrap">
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="media">
                                                <p className="aucp">
                                                </p><table className="table" style={{background: '#f2f2f2', border: '1px solid #f2f2f2'}}>
                                                <tbody>
                                                <tr><td style={{textTransform: "uppercase"}}>Assignment ID:</td>
                                                    <td><span style={{color: '#000', fontWeight: 'bold' ,textTransform: "uppercase"}}>{this.state.auction.id} </span></td></tr>
                                                <tr><td style={{textTransform: "uppercase"}}>Stage of Competition:</td>
                                                    <td><span style={{color: '#fbc500', fontWeight: 'bold',textTransform: "uppercase"}}>Auctions</span></td></tr>
                                                    <tr><td style={{textTransform: "uppercase"}}>File:</td>
                                                        <td><span style={{color: '#e60000', fontWeight: 'bold',textTransform: "uppercase"}}><a href={"/file/"+this.state.auction.file} download>{this.state.auction.file}</a></span></td>
                                                        </tr>
                                                </tbody>
                                            </table>
                                                <p />
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="row col-md-11">
                                        <div className="table-responsive col-md-12" style={{margin: '0 auto'}}>
                                            <table className="table table-bordered table-striped table-hover bg-info-100">
                                                <tbody>
                                                <tr><td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}>Formatting Style:</td>
                                                    <td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}><span style={{color: '#000', fontWeight: 'bold'}}>{this.state.assignmentFormat}</span></td>
                                                    <td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}>Paper Length:</td>
                                                    <td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}><span style={{color: '#000', fontWeight: 'bold'}}>{this.state.auction.page} Pages ({this.state.auction.word} Words) Total= {this.state.auction.page * this.state.auction.word} words</span></td></tr>
                                                    <tr><td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}>Academic Level:</td>
                                                    <td style={{border: '1px solid #d0d0d0'}}><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>{this.state.auction.academic}</span></td>
                                                    <td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}>Paper Size:</td>
                                                    <td style={{border: '1px solid #d0d0d0'}}><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>{this.state.auction.word == '550' ? <p>Double Space</p>:<p>Single Space</p> }</span></td></tr>
                                                <tr>
                                                    <td style={{border: '1px solid #d0d0d0',textTransform: "uppercase"}}>Type of Service:</td>
                                                    <td style={{border: '1px solid #d0d0d0'}}><span style={{color: '#000', fontWeight: 'bold',textTransform: "uppercase"}}>{this.state.auction.service}</span></td></tr></tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>   
                 </div>
                <div className="modal-footer">
                   <button type="button" className="btn btn-secondary btn-rounded" data-dismiss="modal">Close</button>
                 </div>
                </div>
                    </div>
                </div>
            





            </div>
        );

    }
}
export default AssignmentList;
const styles = {
    panelBody: {
        display : 'flex',
        flexDirection: 'column'
    },
    title:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    titleBody : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    otherDetails : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatar : {
        width: 50,
        height: 50,
        marginRight: 10
    },
    headerUser: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
}
