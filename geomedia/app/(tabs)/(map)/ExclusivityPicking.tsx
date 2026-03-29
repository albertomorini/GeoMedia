import { ThemedText } from '@/components/themed-text';
import { useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { style } from '@/components/globalstyle';
import RangeTimePicker from '../../mycomponents/RangeTimePicker';
import ListItem from '@/app/mycomponents/ListItem';
import { doRequest } from '@/app/utility';
import { MyContext } from '@/app/_layout';
import { ThemedView } from '@/components/themed-view';

const ExclusivityPicking = (props) => {

    const ctx = useContext(MyContext);
    const [selectedOptions, setSelectedOptions] = useState(0);
    const segmentsOptions = props?.isCategory ? ['Date & Time', 'Viewers', "Creators"] : ['Date & Time', 'Viewers']

    const refTimeRange = useRef()
    const [listUsers, setListUsers] = useState(null);
    const [viewers, setViewers] = useState(props?.EXCLUSIVITY?.VIEWERS == null ? [] : props?.EXCLUSIVITY?.VIEWERS)
    const [creators, setCreators] = useState(props?.EXCLUSIVITY?.CREATORS == null ? [] : props?.EXCLUSIVITY?.CREATORS)
    ////////////////////////////////////////////////////////////

    function getUsersList() {
        doRequest("users_list", {
            "uid": ctx?.getUID()
        }).then(resQuery => {
            let x = resQuery.map(s => { //transform it to make it compatible with listitem/itemiconizable
                return {
                    ID: s?.UID,
                    TITLE: s?.USERNAME,
                    ICON: s?.PROFILE_PICTURE
                }
            })
            setListUsers(x)
        })
    }

    useEffect(() => {
        getUsersList()
    }, [])

    return (
        <>
            <TouchableOpacity style={[style.buttons?.full_screen, style.colors?.geomedia_green]}
                onPress={() => {
                    console.log(viewers, creators, JSON.stringify(viewers))

                    /// return ours value
                    let range = refTimeRange?.current?.getRanges()
                    let excl = {}
                    excl.DATERANGE = {
                        DATE_START: range?.start,
                        DATE_END: range?.end,
                        IS_RECURRENT: range?.isrecurrent
                    }
                    excl.VIEWERS = viewers
                    excl.CREATORS = creators
                    props?.setExclusivity(excl)

                }}>
                <ThemedText>Confirm</ThemedText>
            </TouchableOpacity>
            <SegmentedControl
                values={segmentsOptions}
                selectedIndex={selectedOptions}
                onChange={(event) => setSelectedOptions(event.nativeEvent.selectedSegmentIndex)}
            />

            <ThemedView style={{ display: selectedOptions === 0 ? 'flex' : 'none' }}>
                <RangeTimePicker ref={refTimeRange}
                    start={props?.EXCLUSIVITY?.DATERANGE?.DATE_START}
                    end={props?.EXCLUSIVITY?.DATERANGE?.DATE_END}
                    isRecurrent={props?.EXCLUSIVITY?.DATERANGE?.IS_RECURRENT}
                />
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 1 ? 'flex' : 'none' }}>
                <ThemedText style={style.label}>Viewers users</ThemedText>

                <ListItem
                    DATA={listUsers}
                    pickedItem={(pickeditems) => setViewers([...pickeditems])}
                    isSelectable={true}
                    itemSelected={viewers}
                    isImage={true}
                    estimatedSize={100}
                    allowCreation={false}
                    label={"Viewers"}
                />
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 2 ? 'flex' : 'none' }}>

                <ThemedText style={style.label}>Creators users</ThemedText>
                <ListItem
                    DATA={listUsers}
                    pickedItem={(pickeditems) => { setCreators([...pickeditems]) }}
                    isSelectable={true}
                    itemSelected={creators}
                    isImage={true}
                    estimatedSize={100}
                    allowCreation={false}
                    label={"Creators"}
                />

            </ThemedView>


        </>
    );
};

export default ExclusivityPicking;