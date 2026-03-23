import { ThemedText } from '@/components/themed-text';
import { useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { ThemedView } from '@/components/themed-view';
import { style } from '@/components/globalstyle';
import RangeTimePicker from '../../mycomponents/RangeTimePicker';

const ExclusivityPicking = (props) => {

    const [selectedOptions, setSelectedOptions] = useState(0);
    const segmentsOptions = ['Date & Time', 'Users']

    const refTimeRange = useRef()
    ////////////////////////////////////////////////////////////

    return (
        <ThemedView style={style.container}>
            <TouchableOpacity style={[style.buttons?.full_screen, style.colors?.geomedia_green]} onPress={() => {
                /// return ours value
                let range = refTimeRange?.current?.getRanges()
                let excl = {}
                excl.DATERANGE = {
                    DATE_START: range?.start,
                    DATE_END: range?.end,
                    IS_RECURRENT: range?.isrecurrent
                }
                excl.USERS = {
                    viewer: ['chiara', 'dexter']
                }
                props?.setExclusivity(excl)

            }}>
                <ThemedText>Confirm</ThemedText>
            </TouchableOpacity>
            <SegmentedControl
                values={segmentsOptions}
                selectedIndex={selectedOptions}
                onChange={(event) => setSelectedOptions(event.nativeEvent.selectedSegmentIndex)}
            />
            {(() => {
                switch (selectedOptions) {
                    case 0: //datetime
                        return <RangeTimePicker ref={refTimeRange}
                            start={props?.EXCLUSIVITY?.DATERANGE?.DATE_START}
                            end={props?.EXCLUSIVITY?.DATERANGE?.DATE_END}
                            isRecurrent={props?.EXCLUSIVITY?.DATERANGE?.IS_RECURRENT}
                        />

                    case 2:
                        return <>
                            <ThemedText>TO BE IMPLEMENTED, chose users</ThemedText>
                        </>
                }
            })()}

        </ThemedView>
    );
};

export default ExclusivityPicking;