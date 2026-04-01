import { useState,useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Edit, User, Lock, Camera, Save, X, Eye, EyeOff } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

// Password change form schema
const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [entities, setEntities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classifications, setClassifications] = useState([]);

  const loadEntities = ()=>{
    axios.post(BASEURL+'entities',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let entities = response.data.data;
      setEntities(entities);
    })
  }
  const loadCategories = ()=>{
    axios.post(BASEURL+'categories',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let categories = response.data.data;
      setCategories(categories);
    })
  }
  const loadClassifications = ()=>{
    axios.post(BASEURL+'classifications',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let classifications = response.data.data;
      setClassifications(classifications);
    })
  }
  
  // Mock user data
  const [userData, setUserData] = useState([]);


  const loadProfile = () =>{
    axios.post(BASEURL+'me',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let profile = response.data.data;
        setUserData(profile);
    })
  }
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: ""
    },
  });
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isChangingPassword) {
      setIsChangingPassword(false);
    }
  };
  
  const handlePasswordChangeToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    if (isEditing) {
      setIsEditing(false);
    }
  };
  
  const handleSaveProfile = () => {
     userData.entity = userData.entities['guid'];
     userData.classification = userData.classifications['guid'];
     userData.category = userData.categories['guid'];
    // In a real app, this would save to the database
     axios.post(BASEURL+'update_profile', userData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
      .then(response => {
        if(response.status==200 && response.data.status==200){
          setIsEditing(false);
          toast.success("Profile updated successfully");
        }
        else{
          toast.error(response.data.message.error_msg);
        }
      });
  };
  
  const handleSavePassword = (data: z.infer<typeof passwordSchema>) => {
    // In a real application, this would verify the current password with the server
    console.log("Password change data:", data);

    axios.post(BASEURL+'change_password', data, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
      .then(response => {
       if(response.status==200 && response.data.status==200){
          // Reset form and close password change section
          passwordForm.reset();
          setIsChangingPassword(false);
          
          // Show success toast
          toast.success("Password updated successfully");
       }
       else{
         toast.error("Invalid Old Password");
       }
      }
      ).catch(error => {
         if (error.response && error.response.status === 400) {
          toast.error("Invalid Old Password");
         }
      });
    
    
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  useEffect(()=>{
    loadProfile();
    loadEntities();
    loadCategories();
    loadClassifications();
  },[])
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {userData.image && userData.image!=''  ? (
                  <img 
                    src={userData.image} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-gray-500">{userData?.user?.emp_id}</p>
              
              <div className="mt-2">
                <span className="inline-flex items-center bg-proscape-lighter text-proscape text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {userData?.roles?.rolename}
                </span>
              </div>
              
              <div className="mt-6 w-full space-y-3">
                <button 
                  onClick={handleEditToggle}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                    isEditing 
                      ? "bg-gray-200 text-gray-800" 
                      : "bg-proscape text-white hover:bg-proscape-dark"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Editing
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handlePasswordChangeToggle}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                    isChangingPassword 
                      ? "bg-gray-200 text-gray-800" 
                      : "border border-proscape text-proscape hover:bg-proscape-lighter"
                  }`}
                >
                  {isChangingPassword ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {!isChangingPassword ? (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      value={userData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-gray-900">{userData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <p className="text-gray-900">{userData?.user?.emp_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-gray-900">{userData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      value={userData.mobile}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-gray-900">{userData.mobile}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity
                  </label>
                  {isEditing ? (
                     <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                 name="entity"
                value={userData?.entities?.guid}
              >
                {entities.map((entity, index) => (
                  (userData.entities.guid == entity.guid?
                  (
                  <option key={index} value={entity.entityname}>{entity.entityname}</option>
                ):'')
                  
                ))}
              </select>
                    
                  ) : (
                    <p className="text-gray-900">{userData?.entities?.entityname}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  {isEditing ? (
                    <select
                    name="category"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={userData?.categories?.guid}
                onChange={handleInputChange}
              >
                {categories.map((category, index1) => (
                  (userData.categories.guid == category.guid?
                  (
                  <option key={index1} value={category.id}>{category.description}</option>
                  ):'')
                ))}
              </select>
                  ) : (
                    <p className="text-gray-900">{userData?.categories?.description}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classification
                  </label>
                  {isEditing ? (
                    <select
                      name="classification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      value={userData?.classifications?.guid}
                      onChange={handleInputChange}
                    >
                      {classifications.map((classification, index) => (
                        (userData.classifications.guid == classification.guid?
                          (
                          <option key={index} value={classification.id}>{classification.description}</option>
                          ):"")
                    ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{userData?.classifications?.description}</p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                      {userData.image && userData.image!='' ? (
                        <img 
                          src={userData.image} 
                          alt={userData.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <button className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </button>
                      <p className="mt-1 text-xs text-gray-500">JPG or PNG. Max size 2MB</p>
                    </div>
                  </div> */}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              </div>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleSavePassword)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be at least 6 characters long
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="new_password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button variant="ghost" type="button" onClick={() => setIsChangingPassword(false)} className="mr-2">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Password
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Password Security Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Use a minimum of 6 characters</li>
                  <li>Include at least one uppercase letter</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character (e.g., !@#$%)</li>
                  <li>Don't reuse passwords from other websites</li>
                  <li>Avoid using personal information in your password</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
