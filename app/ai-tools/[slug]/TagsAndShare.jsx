import TagButton from "@/components/Blog/TagButton";
import SharePost from "@/components/Blog/SharePost";

const TagsAndShare = ({ tags }) => {
  return (
    <div className="items-center justify-between sm:flex mb-4 mt-4     border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                       <div className="mb-5">
                         <h4 className="mb-3 text-sm font-medium text-body-color">
                           Related Tags :
                         </h4>
                         <div className="flex items-center ">
                         {tags && tags.slice(0, 3).map((tag) => (
       <TagButton key={tag?.name} href={tag?.link} text={tag?.name} /> 
     ))}
                         </div>
                       </div>
                       <div className="mb-5">
                         <h5 className="mb-3 text-sm font-medium text-body-color sm:text-right">
                           Share this post :
                         </h5>
                         <div className="flex items-center sm:justify-end">
                           <SharePost />
                         </div>
                       </div>
                     </div>
  );
};

export default TagsAndShare;