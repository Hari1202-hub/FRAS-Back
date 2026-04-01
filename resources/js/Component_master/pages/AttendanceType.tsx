import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { AttendanceTypeViewModal } from "../components/AttendanceTypeViewModal";
import { AttendanceTypeFormModal } from "../components/AttendanceTypeFormModal";
import { DeleteAttendanceTypeDialog } from "../components/DeleteAttendanceTypeDialog";
import { toast } from "@/components/ui/use-toast";

import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

// Mock data for attendance types
const mockAttendanceTypes = [];

export default function AttendanceType() {
  const navigate = useNavigate();
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAttendanceType = () => {
    axios.post(BASEURL+'attendancetypes',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let attendanceTypes = response.data.data;
      setAttendanceTypes(attendanceTypes);
    })
  };

  const handleAdd = () => {
   setShowAddForm(true);
  };

  const handleView = (id: number) => {
    const item = attendanceTypes.find(item => item.id === id);
    setViewItem(item);
  };

  const handleEdit = (id: number) => {
    const item = attendanceTypes.find(item => item.id === id);
    setEditItem(item);
  };

  const handleDelete = (id: number) => {
    const item = attendanceTypes.find(item => item.id === id);
    setDeleteItem(item);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      console.log(deleteItem);
      
      const formData = new FormData();
      formData.append('id',deleteItem.guid)
      axios.post(BASEURL+'delete_attendance_type', formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response => {
          
          toast({
            title: "Success",
            description: "Attendance Type deleted successfully.",
          });
          setEditItem(null);
          loadAttendanceType();
      }).catch(error => {
          if (error.response && error.response.status === 400) {
          // setError("Invalid email or password");
          }
      });
    }
  };

  const handleSave = (data: any, isEdit: boolean) => {
     const formData = new FormData();
    formData.append("attendance_type", data.attendanceType);
    formData.append("description", data.description);
    formData.append("status", data.status);
    if (isEdit && editItem) {
      formData.append("id", editItem.id);
      axios.post(BASEURL+'update_attendance_type',formData,{
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
        }).then(response=>{
            setEditItem(null);
           loadAttendanceType();
        })
      setEditItem(null);
    } else {
       
        axios.post(BASEURL+'create_attendance_type',formData,{
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
        }).then(response=>{
          
            loadAttendanceType();
          
        })
      setShowAddForm(false);
    }
  };
  useEffect(() => {
    loadAttendanceType();
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Type</h1>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Sl. No</TableHead>
              <TableHead>Attendance Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceTypes.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{item.attendance_type}</TableCell>
                <TableCell className="text-gray-600">{item.description}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.isactive === true ? "default" : "secondary"}
                    className={item.isactive === true ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {item.isactive?'Active':'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleView(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <AttendanceTypeViewModal 
        item={viewItem} 
        onClose={() => setViewItem(null)} 
      />
      
      <AttendanceTypeFormModal 
        item={editItem} 
        isOpen={showAddForm || !!editItem}
        onClose={() => {
          setEditItem(null);
          setShowAddForm(false);
        }}
        onSave={handleSave}
      />
      
      <DeleteAttendanceTypeDialog 
        item={deleteItem}
        onCancel={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
