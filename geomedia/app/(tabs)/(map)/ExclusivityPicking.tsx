import { ThemedText } from '@/components/themed-text';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import SegmentedControl from '@react-native-community/segmented-control';
import { style } from '@/components/globalstyle';
import RangeTimePicker from '../../mycomponents/RangeTimePicker';
import ListItem from '@/app/mycomponents/ListItem';
import { doRequest } from '@/app/utility';
import { MyContext } from '@/app/_layout';
import { ThemedView } from '@/components/themed-view';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '@/components/LanguageProvider';

const ExclusivityPicking = (props) => {

    const ctx = useContext(MyContext);
    const { langselected } = useLanguage()
    const [selectedOptions, setSelectedOptions] = useState(0);
    // const segmentsOptions = props?.creatorsEnabled ? ['Date & Time', 'Viewers', "Creators"] : ['Date & Time', 'Viewers']
    const segmentsOptions = props?.creatorsEnabled ? langselected.exclusivity.menuCreator : langselected.exclusivity.menuViewer

    const refTimeRange = useRef()
    const [listUsers, setListUsers] = useState(null);


    const refViewers = useRef();
    const refCreators = useRef();
    ////////////////////////////////////////////////////////////

    function getUsersList() {
        doRequest("users", {
            "uid": ctx?.getUID()
        }, "GET").then(resQuery => {
            let x = resQuery.map(s => { //transform it to make it compatible with listitem/itemiconizable
                return {
                    ID: s?.UID,
                    TITLE: s?.USERNAME,
                    ICON: s?.PROFILE_PICTURE
                }
            })
            setListUsers(x)
        }).catch(err => {
            ctx?.showToast({
                type: "error",
                text1: "Error",
                text2: "Network error... are you offline?"
            })
        })
    }


    useFocusEffect( //to handle the back on routing
        useCallback(() => {
            getUsersList();
            setTimeout(() => {
                refViewers?.current?.load_item_selected(props?.EXCLUSIVITY?.VIEWERS)
                refCreators?.current?.load_item_selected(props?.EXCLUSIVITY?.CREATORS)
                let dummy_ranges = props?.EXCLUSIVITY?.DATERANGE
                refTimeRange?.current?.load_dates(dummy_ranges.DATE_START, dummy_ranges?.DATE_END, dummy_ranges?.RECURRENT)
            }, 500);
        }, [props?.itemSelected, props?.EXCLUSIVITY])
    )

    return (
        <>
            <TouchableOpacity style={[style.buttons?.full_screen, style.colors?.geomedia_green]}
                onPress={() => {
                    /// return ours value
                    let range = refTimeRange?.current?.get_dates()
                    let excl = {}
                    excl.DATERANGE = {
                        DATE_START: range?.start,
                        DATE_END: range?.end,
                        RECURRENT: range?.recurrent
                    }
                    let dummy_viewers = refViewers?.current?.get_item_selected()
                    let dummy_creators = refCreators?.current?.get_item_selected()


                    /// TODO: dunno, maybe if I want that all users to see, i uncheck the exclusivity... is just need to be a comunication/tutorial
                    // // if (dummy_viewers?.length == listUsers?.length) { // IF ALL USERS ARE SELECTED, REMOVE THE EXCLUSIVITY
                    // //     dummy_viewers = []
                    // // }
                    // // if (dummy_creators.length == listUsers?.length) { //IF ALL USERS ARE SELECTED, REMOVE THE EXCLUSIVITY
                    // //     dummy_creators = []
                    // // }

                    excl.VIEWERS = dummy_viewers
                    excl.CREATORS = dummy_creators

                    props?.setExclusivity(excl)

                }}>
                <ThemedText>{langselected.confirm}</ThemedText>
            </TouchableOpacity>

            {/* ---------------------------------------- */}
            {/* ---------------------------------------- */}


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
                    <RangeTimePicker ref={refTimeRange} />
                </ThemedView>
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 1 ? 'flex' : 'none' }}>
                <ThemedText style={style.label}>{langselected.exclusivity.viewers}</ThemedText>

                <ListItem
                    ref={refViewers}
                    DATA={listUsers}
                    isSelectable={true}
                    isImage={true}
                    estimatedSize={100}
                    allowCreation={false}
                    label={"Viewers"}
                />
            </ThemedView>

            <ThemedView style={{ display: selectedOptions === 2 ? 'flex' : 'none' }}>

                <ThemedText style={style.label}>{langselected.exclusivity.creators}</ThemedText>
                <ListItem
                    ref={refCreators}
                    DATA={listUsers}
                    isSelectable={true}
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