import React, { Component } from 'react';
import {
    Text,
    View,
    ScrollView,
    InteractionManager,
    Platform
} from 'react-native';

import { LinearGradient } from 'expo';

import { CSS } from './styles';

export default class Picker extends Component {
    static defaultProps = {
        pickerHeight: 225,
        boxHeight: 25,
        scrollPad: 100
    }

    constructor(props) {
        super(props);
        let data = props.data;
        this.onScrollCount = 0;
        this.state = {
            numberRange: [...[...Array(10)].map((_, i) => `${i}`), ...[...Array(10)].map((_, i) => i), ...[...Array(10)].map((_, i) => `${i}`)],
            data,
            pScroll1Init: true,
            pScroll2Init: true
        };
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.refs.pScrollView.scrollTo({ y: this.state.data * this.props.boxHeight, animated: true });
        });
        
        if (this.props.selectTo) {
            this.selectTo(this.props.selectTo);
        }
    }

    onScrollEndDrag(e) {
        let y = e.nativeEvent.contentOffset.y;
        let onScrollEndDragCount = this.onScrollCount;
        let start = Date.now();
        if (this.fixInterval) {
            clearInterval(this.fixInterval);
        }
        // picker2 (containing selected item) has a time delay.  add 10ms delay to scroll end to sync
    
        this.fixInterval = setInterval(() => this.timeFix(start, y, onScrollEndDragCount), 10);
    }

    onMomentumScrollEnd(e) {
        this.onScrollEnd(e.nativeEvent.contentOffset.y);
    }

    onScroll(e) {
        this.onScrollCount++;
        let y = e.nativeEvent.contentOffset.y;
        if (this.refs.pScrollView2) {
            this.refs.pScrollView2.scrollTo({ y, animated: false });
        }
        
        const totalScrollPadding = (this.props.scrollPad / 2) + (this.props.scrollPad + (this.props.boxHeight / 2));

        let bottomTriggerLimit = this.state.p1ContentSize - (this.props.boxHeight * 4) - totalScrollPadding;
        if (y > bottomTriggerLimit) {
            let prev10ChunkY = y - (10 * this.props.boxHeight);
            this.refs.pScrollView.scrollTo({ y: prev10ChunkY, animated: false });
            this.refs.pScrollView2.scrollTo({ y: prev10ChunkY, animated: false });
        }

        let topTriggerLimit = this.props.boxHeight * 6;
        if (y < topTriggerLimit) {
            let next10ChunkY = y + (10 * this.props.boxHeight);
            this.refs.pScrollView.scrollTo({ y: next10ChunkY, animated: false });
            this.refs.pScrollView2.scrollTo({ y: next10ChunkY, animated: false });
        }
    }

    onScrollEnd(y) {
        let y1 = y - (y % this.props.boxHeight);
        if (y % this.props.boxHeight > (this.props.boxHeight / 2)) {
            y1 += this.props.boxHeight;
        }
        let index = y1 / this.props.boxHeight;
        
        // console.log(y, y1, index);
        if (this.refs.pScrollView) {
            this.refs.pScrollView.scrollTo({ y: y1, animated: false });
        }
        if (this.props.onPickerSelect) {
            this.props.onPickerSelect(index % 10, this.props.placeValue);
        }
    }

    getItem(size) {
        if (this.state.numberRange.length === 0) {
            return false;
        }

        let arr = this.state.numberRange;
        return arr.map((item, i) => {
            if (size === 'big') {
                return (
                    <LinearGradient
                        key={i}
                        colors={['#343434', '#1C1C1C', '#121212']}
                        style={{ ...styles.boxContainer, height: this.props.boxHeight - 2 }}
                        renderToHardwareTextureAndroid
                    >
                        <Text style={{ ...styles.selectedBoxStyle }}>
                        {item}
                        </Text>
                    </LinearGradient>
                    // <View key={i} style={{ ...styles.boxContainer, ...styles.selectBoxContainer, height: this.props.boxHeight - 2 }}>
                    //     <Text style={{ ...styles.selectedBoxStyle }}>
                    //     {item}
                    //     </Text>
                    // </View>
                );
            }
            return (
                <LinearGradient
                    key={i}
                    colors={['#242424', '#1B1B1B', '#111']}
                    style={{ ...styles.boxContainer, height: this.props.boxHeight - 2 }}
                    renderToHardwareTextureAndroid
                >
                    <Text style={{ ...styles.idleBoxStyle }}>
                    {item}
                    </Text>
                </LinearGradient>
                    
                // <View key={i} style={{ ...styles.boxContainer, ...styles.idleBoxContainer, height: this.props.boxHeight - 2 }}>
                //     <Text style={{ ...styles.idleBoxStyle }}>
                //     {item}
                //     </Text>
                // </View>
            );
        });
    }

    selectTo(index) {
        let y = index * 25;
        if (this.refs.pScrollView) {
            this.refs.pScrollView.scrollTo({ y, animated: false });
        }
    }

    timeFix(start, y, onScrollEndDragCount) {
        let now = Date.now();
        let end = 200;
        if (now - start > end) {
            clearInterval(this.fixInterval);
            if (onScrollEndDragCount === this.onScrollCount) {
                this.onScrollEnd(y);
            }
        }
    }

    handleP1ContentSizeChange = (width, height) => {
        if (Platform.OS === 'android') {
            if (this.state.pScroll1Init) {
                // this.handleP1ContentSizeChange = null;
                this.refs.pScrollView.scrollTo({ y: (this.state.data * this.props.boxHeight) + (this.props.boxHeight * 10), animated: true });
            }
        }
        this.setState({ pScroll1Init: false, p1ContentSize: height });
    }

    handleP2ContentSizeChange = (width, height) => {
        if (Platform.OS === 'android') {
            if (this.state.pScroll2Init) {
                // this.handleP2ContentSizeChange = null;
                this.refs.pScrollView2.scrollTo({ y: (this.state.data * this.props.boxHeight) + (this.props.boxHeight * 10), animated: true });
            }
        }
        this.setState({ pScroll2Init: false, p2ContentSize: height });
    }

    render() {
        // console.log(this.state)
        return (
            <View style={{ flex: 1 }}>
                <View style={{ ...styles.pickerStyle, height: this.props.pickerHeight }}>
                    <ScrollView
                        contentOffset={{ x: 0, y: (this.state.data * this.props.boxHeight) + (this.props.boxHeight * 10) }}
                        onContentSizeChange={this.handleP1ContentSizeChange}
                        bounces={false}
                        onScrollEndDrag={(e) => { this.onScrollEndDrag(e); }}
                        onMomentumScrollEnd={(e) => { this.onMomentumScrollEnd(e); }}
                        onScroll={(e) => { this.onScroll(e); }}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        ref='pScrollView'
                        renderToHardwareTextureAndroid
                        scrollsToTop={false}
                    >
                        <View style={{ height: this.props.scrollPad / 2 }} />
                            {this.getItem('small')}
                        <View style={{ height: this.props.scrollPad + (this.props.boxHeight / 2) }} />
                    </ScrollView>
                </View>
                <View 
                    style={{
                        ...styles.selectedPickerStyle,
                        height: this.props.boxHeight,
                        marginTop: -(this.props.pickerHeight - (this.props.scrollPad / 2)),
                    }}
                    pointerEvents='none'
                >

                    <ScrollView
                        contentOffset={{ x: 0, y: (this.state.data * this.props.boxHeight) + (this.props.boxHeight * 10) }}
                        onContentSizeChange={this.handleP2ContentSizeChange}
                        showsVerticalScrollIndicator={false}
                        ref='pScrollView2'
                        renderToHardwareTextureAndroid
                        scrollsToTop={false}
                    >
                        {this.getItem('big')}
                    </ScrollView>

                    
                </View>
                <View 
                    style={{ height: this.props.scrollPad / 2 }}
                    pointerEvents='none'
                />
            </View>
        );
    }
}

const styles = {
    boxContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        margin: 1
    },
    idleBoxStyle: {
        color: '#5A5A5C',
    },
    idleBoxContainer: {
        backgroundColor: '#333',
    },
    selectBoxContainer: {
        backgroundColor: '#444',
    },
    selectedBoxStyle: {
        color: '#fff',
        fontWeight: 'bold'
    },
    pickerStyle: {
        backgroundColor: '#000',
        
    },
    selectedPickerStyle: {
        backgroundColor: '#000',
        
    }
};
