/* eslint-disable no-undef */
import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from '../../Context/ChatProvider';
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import { wrap } from 'framer-motion';
import {BASE_URL} from "../../url"

const GroupChatModal = ({ children }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, setChats } = ChatState();
    const handleSearch = async (query) => {
        setSearch(query)
       

        if (!query) {
            return;
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${BASE_URL}/api/user?search=${search}`, config);
           
            setLoading(false);
            setSearchResult(data);
        }
        catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
          
            const { data } = await axios.post(`${BASE_URL}/api/chat/group`, {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id))

            }, config)

           
            setChats([data, ...chats]);

            onClose();
            toast({
                title: "new group chat created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            });



        } catch (error) {
            toast({
                title: "sorry!!! failed to create group chat",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    }

    const handleDelete = (delUser) => { setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id)) }

    const handleGroup = (userToAdd) => {
        
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
        
    }

   



    return (
        <>

            <span onClick={onOpen}>
                {children}
            </span>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create  Group</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody d="flex" flexDirection="column" alignItems="center">
                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add Users eg: srinjay, debosmita, ravi ' mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        {/* selected users */}
                        <Box w='100%' display='flex' flexWrap="wrap">
                            {selectedUsers.map(u => (
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleDelete(u)} />

                            ))}
                        </Box>
                        {/* render searched users */}
                        {loading ? <div>loading....</div> : (
                            searchResult.slice(0, 4).map(user => (
                                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                            )))}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='green' onClick={handleSubmit}>
                            Create Chat
                        </Button>

                    </ModalFooter>
                    
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal