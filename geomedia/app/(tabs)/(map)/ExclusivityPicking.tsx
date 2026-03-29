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


    const refViewers = useRef();
    const refCreators = useRef();
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
        getUsersList();
        setTimeout(() => {
            console.log("inexcl,", props?.EXCLUSIVITY)
            refViewers?.current?.load_item_selected(props?.EXCLUSIVITY?.VIEWERS)
            refCreators?.current?.load_item_selected(props?.EXCLUSIVITY?.CREATORS)
        }, 500);
    }, [props])

    return (
        <>
            <TouchableOpacity style={[style.buttons?.full_screen, style.colors?.geomedia_green]}
                onPress={() => {
                    /// return ours value
                    let range = refTimeRange?.current?.getRanges()
                    let excl = {}
                    excl.DATERANGE = {
                        DATE_START: range?.start,
                        DATE_END: range?.end,
                        IS_RECURRENT: range?.isrecurrent
                    }
                    excl.VIEWERS = refViewers?.current?.get_item_selected()
                    excl.CREATORS = refCreators?.current?.get_item_selected()

                    console.log(excl)
                    props?.setExclusivity(excl)

                }}>
                <ThemedText>Confirm</ThemedText>
            </TouchableOpacity>
            <SegmentedControl
                values={segmentsOptions}
                selectedIndex={selectedOptions}
                onChange={(event) => {
                    setSelectedOptions(event.nativeEvent.selectedSegmentIndex)
                    // refViewers?.current?.load_item_selected(props?.EXCLUSIVITY?.VIEWERS)

                }}
            />

            <ThemedView style={{ display: selectedOptions === 0 ? 'flex' : 'none' }}>
                <ThemedView style={{ height: "100%" }}>

                    <RangeTimePicker ref={refTimeRange}
                        start={props?.EXCLUSIVITY?.DATERANGE?.DATE_START}
                        end={props?.EXCLUSIVITY?.DATERANGE?.DATE_END}
                        isRecurrent={props?.EXCLUSIVITY?.DATERANGE?.IS_RECURRENT}
                    />
                </ThemedView>
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 1 ? 'flex' : 'none' }}>
                <ThemedText style={style.label}>Viewers users</ThemedText>

                <ListItem
                    ref={refViewers}
                    DATA={listUsers}
                    // pickedItem={(pickeditems) => setViewers([...pickeditems])}
                    isSelectable={true}
                    // itemSelected={props?.EXCLUSIVITY?.VIEWERS}
                    isImage={true}
                    estimatedSize={100}
                    allowCreation={false}
                    label={"Viewers"}
                />
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 2 ? 'flex' : 'none' }}>

                <ThemedText style={style.label}>Creators users</ThemedText>
                <ListItem
                    ref={refCreators}
                    DATA={listUsers}
                    // pickedItem={(pickeditems) => { setCreators([...pickeditems]) }}
                    isSelectable={true}
                    // itemSelected={creators}
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