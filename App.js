import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Tripmeter } from './Tripmeter';

export default class App extends React.Component {

    static defaultProps = {
        initialValue: 789,
        tripmeterHeight: 150,
        boxHeight: 50,
        digits: 7
    }

    state = {
        tripMeterValue: 0
    }

    onTripMeterChange = (value) => {
        this.setState({ tripMeterValue: value });
    }

    render() {
        return (
            <View style={styles.container}>
                <Tripmeter 
                    digits={this.props.digits}
                    initial={this.props.initialValue}
                    tripmeterHeight={this.props.tripmeterHeight}
                    boxHeight={this.props.boxHeight}
                    onTripMeterChange={this.onTripMeterChange}
                />
                <Text style={{ marginTop: 55 }}>Tripmeter initial value: {this.props.initialValue}</Text>
                <Text>Selected value: {this.state.tripMeterValue}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2089dc',
        flex: 1,
        
    },
});
