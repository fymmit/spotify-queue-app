const UserProfile = (props: { user?: { display_name: string; }; }) => {
    return (
        <div>
            {props.user !== undefined ? `Logged in as: ${props.user.display_name}` : 'Not logged in.'}
        </div>
    )
};

export default UserProfile;
