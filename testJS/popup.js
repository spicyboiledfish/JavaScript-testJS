/**
 * Created by ruiwang on 2017/6/28.
 */
/**
 * Created by ruiwang on 17/6/26.
 */
'use strict';
import React, {Component} from 'react';
import  {
    StyleSheet,
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Animated,
    TouchableWithoutFeedback,
    TouchableHighlight
} from 'react-native';
import {Basic,Color,Global,Actions,AppDevice,CMIcons,CMModal} from 'LocalReference';
import CMfaceNotice from '../../libs/CMfaceNotice/index';
var deviceWidth = AppDevice.screenWidth();
var deviceHeight = AppDevice.screenHeight();
var minWidth = AppDevice.minWidth();
export default class BottomModal extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            modalVisible: false,
            modalAnimatedHeight: new Animated.Value(-400),
            chaAnim: new Animated.Value(0),
            loanState: props.loanState ? props.loanState : 0,
            title: this.props.title,
            content: this.props.content,
        }
    }

    showBtnModalOrNo() {
        var _this = this;
        var isShow = this.state.modalVisible;
        if (isShow) {
            Animated.timing(          // Uses easing functions
                _this.state.chaAnim,    // The value to drive
                {toValue: 0, duration: 150}            // Configuration
            ).start(()=> {
                Animated.timing(          // Uses easing functions
                    _this.state.modalAnimatedHeight,    // The value to drive
                    {toValue: -400, duration: 300}            // Configuration
                ).start(()=> {
                    _this.CMModal.hideModal();
                    _this.setState({
                        modalVisible: false,
                    })
                    _this.props.checkFaceRecognition();
                });
            })
        } else {
            _this.setState({
                modalVisible: true,
            })
            _this.CMModal.showModal(function () {
                Animated.timing(// Uses easing functions
                    _this.state.modalAnimatedHeight,    // The value to drive
                    {toValue: 0, duration: 300}            // Configuration
                ).start(()=> {
                    Animated.timing(// Uses easing functions
                        _this.state.chaAnim,    // The value to drive
                        {toValue: 1, duration: 150}            // Configuration
                    ).start();
                });
            });
        }
    }

    render() {
        let _this = this;
        return (
            <CMModal
                ref={(refs)=>{this.CMModal=refs;}}
            >
                <TouchableOpacity style={styles.modalSpace} onPress={()=>this.showBtnModalOrNo()} activeOpacity={1}/>
                <Animated.View style={[styles.modalAnimate, {marginBottom: this.state.modalAnimatedHeight}]}>
                    <View style={styles.modalContainer}>
                        <CMfaceNotice />
                        <TouchableOpacity onPress={()=>this.showBtnModalOrNo()} activeOpacity={1}
                                          style={[styles.modalChaView]}>
                            <Text style={styles.modalChaText}>我知道了</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </CMModal>
        )
    }
}

const styles = StyleSheet.create({
    modalSpace: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0,0.7)',
    },
    modalContainer: {
        alignItems: 'center',
        position:'relative',
        height:deviceHeight * 0.78
    },
    modalAnimate: {
        backgroundColor: 'white'
    },
    modalTitle: {
        color:'#333',
        fontSize: 17,
        marginTop: 18,
        marginBottom: 18,
        fontWeight:'400'
    },
    itemSeparator: {
        height: minWidth,
        backgroundColor: Color.CM_BorderColor,
    },
    modalText: {
        marginTop: 25,
        // marginBottom: 180,
        color: '#2a2a2a',
        fontSize: 16,
        fontWeight: '200',
        width: deviceWidth * 0.9,
        lineHeight: 22,
        textAlign:'justify',
    },
    modalChaView: {
        position:'absolute',
        bottom:0,
        left:0,
        alignItems:'center',
        justifyContent:'center',
        width:deviceWidth,
        height:50,
        backgroundColor:Color.CMBlueColor
    },
    modalChaText: {
        color:Color.CM_WhiteColor,
        fontSize:17,
    }
});
