/**
 * Created by ruiwang on 2017/6/28.
 */
/**
 * Created by pengguo on 16/12/26.
 * 填写审核信息 第一步
 */

'use strict';
import React, {Component} from "react";
import {StyleSheet, Image, Text, ScrollView, View, TouchableOpacity} from "react-native";
import {
    Basic,
    Color,
    AppDevice,
    CMTextInput,
    Global,
    Actions,
    CMMessageBox,
    Constants,
    Filter,
    Config,
    CMIcons
} from "LocalReference";
import {ButtonNext, ButtonCard, Label, CMModuleHelper} from "../common/index";
import CMBtnModal from '../../../components/CMBtnModal';
import CMRoundIcon from '../../../components/CMRoundIcon';
import AuditServices from "../../../services/audit/AuditServices";
import Permissions from "react-native-permissions";
import BlockButton from '../../my/comps/BlockButton';
var isIOS = Global.isIOS();
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
const styles = StyleSheet.create({
    cardInfoText: {
        marginLeft: 20,
        marginTop: 12,
        marginBottom: 8,
        fontSize: 14,
    },
    realIDViewCon: {
        flexDirection: "row",
        backgroundColor: Color.CM_WhiteColor,
        borderTopColor: Color.CM_BorderColor,
        borderTopWidth: AppDevice.minWidth(),
        alignItems: "center",
        justifyContent: "center",
        // paddingTop: 10,
        // paddingBottom: 10,
    },
    realIDImageView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 15,
        paddingTop: 10,
        paddingBottom: 10,
        // borderColor:'green',
        // borderWidth:2

    },
    realIDView: {
        flexDirection: 'column',
        flex: 2,
        // borderWidth:2,
        // borderColor:'red'
    },
    borderLine: {
        height: AppDevice.minWidth(),
        backgroundColor: Color.CM_BorderColor,
        marginLeft: 16,
    },
    textInput: {
        fontSize: 16,
        marginLeft: 8,
        color: "#2a2a2a",
        height: 50,
        padding: 0,
        // borderColor:'#000',
        // borderWidth:1
    },
    infoLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        // marginVertical: 10
    },
    infoLineText: {
        color: Color.CMHeaderBgColor,
        fontSize: 12,
        marginLeft: 3
    },
    imageIdCard: {
        width: (AppDevice.screenWidth() / 3.5),
        height: (AppDevice.screenWidth() / 3.5) * 54 / 85.6,//身份证长宽比 85.6/54

    },
    idCardContent: {
        borderTopColor: Color.CM_BorderColor,
        borderTopWidth: AppDevice.minWidth(),
        borderBottomColor: Color.CM_BorderColor,
        borderBottomWidth: AppDevice.minWidth(),
        backgroundColor: Color.CM_WhiteColor,
        marginBottom: 40,
        paddingLeft: 10,
    },
    idCardName: {
        height: 50,
        borderBottomWidth: AppDevice.minWidth(),
        borderBottomColor: Color.CM_BorderColor,
        justifyContent: 'center'
    },
    idCardNameText: {
        color: Color.CM_FormGreyColor,
        fontSize: 16,
    },
    idCardId: {
        height: 50,
        justifyContent: 'center'
    },
    idCardIdText: {
        color: Color.CM_FormGreyColor,
        fontSize: 16,
    },
    editIcon: {
        position: 'absolute',
        right: 15,
        marginVertical: 15
    },
    viewPosition: {
        position: 'relative'
    },
    line: {
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        marginLeft: 8
    },
    labelStyle: {
        lineHeight: 18
    }
});
var flagRN = false;//防止多次点击
var flagHT = false;//防止多次点击
export default class extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            buttonEnabled: false,
            id: '',
            name: '',
            idImage: '',
            htImage: '',
            isCheckRealName: false, //实名认证
            popOrNot: 0  //标志弹窗是否关闭
        }
        this.Scaned = false;
        this.auditBiz = new AuditServices();
        this.auditInfo = this.auditBiz.getCurAudit();
    }

    componentDidMount() {
        if (this.auditInfo && this.auditInfo.isCheckRealname == '1' && this.auditInfo.applyCurrentStep == "0") {
            this.setState({
                isCheckRealName: true
            });
            this.getObjectRealNameByUserNo();
        }
    }

    /*根据userNo查询用户实名认证信息*/
    getObjectRealNameByUserNo() {
        var _this = this;
        Global.ShowLoading();
        var params = {
            applyNo: this.auditInfo.applyNo
        };
        this.auditBiz.getObjectRealNameByUserNo(params).then(function (data) {
            Global.HideLoading();
            if (data && data.success == "1" && data.data && data.data.retUserIdentity) {
                var result = data.data.retUserIdentity;
                _this.setState({
                    id: result.identityNo,
                    name: result.realname,
                });
            }
            else {
                if (data.error && data.error.message != "") {
                    CMMessageBox.showToast(data.error.message);
                }
            }
        });
    }

    /*校验相机权限权限*/
    async openNativeCamera(callback = () => {
    }) {
        Permissions.getPermissionStatus('camera', 'always')
            .then(response => {
                if (response == "denied") {
                    var params = {
                        iosTitle: "您未授权访问相机",
                        iosContent: "请在手机【设置】-【隐私】-【相机】中开启开关",
                        androidTitle: "您未授权访问相机",
                        androidContent: "请在手机【设置】中检查是否有访问相机服务权限，或重启设备后重试",
                    };
                    CMModuleHelper.startService(params);
                }
                else if (response == "undetermined") {
                    Permissions.requestPermission('camera', 'always').then(
                        response => {
                            callback.call();
                        }
                    );
                }
                else {
                    callback.call();
                }
            });
    }

//扫描身份证
    ScanIDCard() {
        //校验实名次数超限
        var _this = this;
        this.auditBiz.isOverCnt().then(function (result) {
            if (result && result.data && result.success == "1") {
                if (result.data && result.data.isOver == "1") {
                    CMMessageBox.alert("认证次数超限，请24小时后再试，详询【" + Config.CustomerServicePhone + "】");
                }
                else {
                    _this.openNativeCamera(function () {
                        var callBack = (name, id, image) => {
                            _this.Scaned = true;
                            _this.setState({id: id, name: name, idImage: image});
                        }
                        var onError = (error) => {
                            CMMessageBox.alert(error);
                        }
                        CMModuleHelper.idScan(callBack, onError);
                    });
                }
            }
            else {
                if (result.error && result.error.message != "") {
                    CMMessageBox.showToast(result.error.message);
                }
            }
        });
    }

//进行人脸识别
    checkFaceRecognition() {
        /*防止多次点击*/
        if (flagHT) {
            return;
        }
        flagHT = true;
        var timeoutHT = setTimeout(function () {
            flagHT = false;
            clearTimeout(timeoutHT);
        }, Config.clickMoreTime);
        /*防止多次点击*/
        var _this = this;
        this.setState({
            popOrNot: 1
        });
        alert(378);
        if (this.state.popOrNot == 1) {
            this.openNativeCamera(
                function () {
                    var callBack = (image) => {
                        //活体返回的数据 传递API校验
                        if (image != undefined) {
                            var params = {
                                userNo: Global.getUser().userInfo.userNo,
                                applyNo: _this.auditInfo.applyNo,
                                identityID: _this.state.id,
                                photo: image,
                            };
                            Global.ShowLoading();
                            _this.auditBiz.faceDetect(params).then(function (data) {
                                Global.HideLoading();
                                if (data && data.success == "1") {
                                    if (data.data.isCheck == "1") {
                                        _this.setState({
                                            htImage: image,
                                        });
                                        _this.props.goNext();
                                    }
                                    else {
                                        CMMessageBox.alert("识别失败");
                                    }
                                }
                                else {
                                    if (data.error && data.error.message != "") {
                                        CMMessageBox.showToast(data.error.message);
                                    }
                                }
                            });
                        }
                    };
                    CMModuleHelper.liveness(callBack, function (errorMsg) {
                        if (Global.isAndroid()) {
                            if (errorMsg && errorMsg.code == 1) {
                                setTimeout(function () {
                                    var params1 = {
                                        androidTitle: "存储权限未开启",
                                        androidContent: "请在手机【设置】-【应用管理】-【暖薪贷】-【权限管理】中，开启【存储权限】开关",
                                    };
                                    CMModuleHelper.startService(params1);
                                }, 300);
                            }
                        }
                    });
                }
            );
        }
    }

//人脸识别
    FaceRecognition() {
        /*防止多次点击*/
        if (flagRN) {
            return;
        }
        flagRN = true;
        var timeout = setTimeout(function () {
            flagRN = false;
            clearTimeout(timeout);
        }, Config.clickMoreTime);
        /*防止多次点击*/
        if (this.auditInfo && this.auditInfo.isCheckRealname == "1") {
            this.showBtnSimpleModal();
            this.checkFaceRecognition();
        }
        else {
            let _this = this;
            if (!this.Scaned || this.state.id == "") {
                CMMessageBox.confirm("提示", "请先扫描本人身份证", "去扫描", "取消", this.ScanIDCard.bind(_this));
                return;
            }
            var params = {
                userNo: Global.getUser().userInfo.userNo,
                applyNo: this.auditInfo.applyNo,
                identityID: this.state.id,
                realName: this.state.name,
                identifyPhoto: this.state.idImage,
            };
            var result = Filter.isIdCard(this.state.id);
            if (result == "验证通过!") {
                Global.ShowLoading();
                this.auditBiz.realName(params).then(function (data) {
                    Global.HideLoading();
                    if (data && data.success == "1") {
                        if (data.data.isCheck == "1") {
                            var obj = {};
                            var user = Global.getUser().userInfo;
                            user.realname = _this.state.name;
                            user.identityNo = _this.state.id;
                            user.realnameStatus = "1";
                            obj.token = Global.getUser().token;
                            obj.userInfo = user;
                            Global.setUser(obj);
                            _this.auditInfo.isCheckRealname = "1"; //代表已经实名认证过了
                            _this.setState({
                                isCheckRealName: true
                            });
                            RCTDeviceEventEmitter.emit(Constants.EventHandlerConst.LoginState);
                            _this.showBtnSimpleModal();
                            _this.checkFaceRecognition();
                        }
                        else {
                            if (data.data.message != "") {
                                if (data.data.isHelp != "1") {
                                    CMMessageBox.alert(data.data.message);
                                }
                                else {
                                    CMMessageBox.confirm("身份认证失败", data.data.message, "确定", "查看帮助", () => {
                                    }, () => {
                                        Actions.helpCenter();
                                    });
                                }
                            }
                        }
                    }
                    else {
                        if (data.error && data.error.message != "") {
                            CMMessageBox.alert(data.error.message);
                        }
                    }
                });
            }
            else {
                //实名之前校验 身份证号码是否合法
                CMMessageBox.alert(result);
            }
        }
    }

    btnEnable() {
        if (this.props.verified) {
            return this.state.id && this.state.name;
        }
        else {
            return this.state.id && this.state.name && this.state.idImage && this.state.htImage;
        }
    }

    onNext() {
        if (this.props.verified) {
            let params = {
                userNo: Global.getUser().userInfo.userNo,
                applyNo: this.auditInfo.applyNo,
            };
            this.auditBiz.faceVerified(params).then((result) => {
                if (result && result.success == "1") {
                    this.props.goNext();
                }
            });
        }
        else {
            this.props.goNext();
        }

    }

    /*实名认证信息*/
    renderRealID() {
        if (!this.state.id && !this.state.name) {
            return;
        }

        return (
            <View style={styles.realIDViewCon}>
                <View style={styles.realIDImageView}>
                    <Image
                        style={styles.imageIdCard}
                        source={{uri: this.state.idImage}}
                    />
                </View>
                <View style={styles.realIDView}>
                    <View style={styles.viewPosition}>
                        <CMTextInput
                            keyboardType={isIOS ? 'numbers-and-punctuation' : 'email-address'}
                            style={styles.textInput}
                            onChangeText={(text) => {
        this.setState({
            name: text
        })
    }}
                            placeholderTextColor={Color.CM_InputTextColor}
                            value={this.state.name}
                            clearButtonMode='never'
                        ></CMTextInput>
                        <CMIcons name="icon-editor" size={15} color='#198bff' style={styles.editIcon}></CMIcons>
                    </View>
                    <View style={styles.line}></View>
                    <View style={styles.viewPosition}>
                        <CMTextInput
                            style={styles.textInput}
                            keyboardType={'default'}
                            onChangeText={(text) => {
        this.setState({
            id: text
        })
    }}
                            placeholderTextColor={Color.CM_InputTextColor}
                            value={this.state.id}
                            clearButtonMode='never'
                        ></CMTextInput>
                        <CMIcons name="icon-editor" size={15} color='#198bff' style={styles.editIcon}></CMIcons>
                    </View>
                </View>
            </View>
        )
    }

    /*已实名的用户信息显示*/
    renderIDCard() {
        return (
            <View style={styles.idCardContent}>
                <View style={styles.idCardName}>
                    <Text style={styles.idCardNameText}>{Filter.formatName(this.state.name)}</Text>
                </View>
                <View style={styles.idCardId}>
                    <Text style={styles.idCardIdText}>{Filter.formatUserID(this.state.id)}</Text>
                </View>
            </View>
        )
    }


    showBtnSimpleModal() {
        this.refs["btnModal"].showBtnModalOrNo();
    }

    render() {
        return (
            <View style={[Basic.BgDefault]}>
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <Label>身份认证信息提交后不可修改</Label>
                    {
                        this.state.isCheckRealName ?
                            this.renderIDCard() :
                            <ButtonCard
                                textContent="本人身份证正面扫描"
                                icon="icon-id"
                                onPress={() => {
        this.ScanIDCard()
    }}
                                bottomRender={this.renderRealID.bind(this)}
                            >
                            </ButtonCard>
                    }
                    <ButtonCard
                        textContent="人脸识别"
                        icon="icon-facerecognition"
                        verified={this.props.verified}
                        onPress={() => {this.FaceRecognition()}}>
                    </ButtonCard>
                    <TouchableOpacity onPress={()=>this.showBtnSimpleModal()}>
                        <View>
                            <Text>显示弹窗</Text>
                        </View>
                    </TouchableOpacity>
                    <CMBtnModal ref="btnModal" FaceRecognition={this.FaceRecognition.bind(this)}
                                checkFaceRecognition={this.checkFaceRecognition.bind(this)}></CMBtnModal>

                    {/*<View style={styles.infoLine}>
                     <CMRoundIcon viewColor={Color.CMHeaderBgColor} iconColor={Color.CM_WhiteColor} iconSize={6}
                     viewSize={12}/>
                     <Text style={styles.infoLineText}>人脸识别注意事项</Text>
                     </View>
                     <Label labelStyle={styles.labelStyle}>
                     •【不要碰检测框边缘】请将面部整体放置检测框内{'\n'}
                     •【背景简单】尽量使用简洁、纯色单一背景{'\n'}
                     •【面部整洁】长发者应露出两耳，刘海不遮挡额头{'\n'}
                     •【对焦清晰】手指触碰屏幕，保证相机对焦完成{'\n'}
                     •【不要反光】眼镜不能反光，如有反光应暂时摘掉{'\n'}
                     •【不要太暗】顺着光线拍摄，避免逆光，侧光，及强曝光{'\n'}
                     </Label>*/}
                </ScrollView>
                <ButtonNext
                    onPress={() => {
        this.onNext()
    }}
                    enabled={this.btnEnable()}
                >
                    下一步
                </ButtonNext>
            </View>
        )
    }
}