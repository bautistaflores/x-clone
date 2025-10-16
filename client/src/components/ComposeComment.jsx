import FormPost from "./FormPost";

function ComposeComment({parentId}) {

    return (
        <div className="border-b border-gray-500/50">
            <FormPost isCommentPage={true} parentId={parentId}/>
        </div>
    )
}

export default ComposeComment