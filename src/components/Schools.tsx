import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Download,
  Users,
  Building
} from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface School {
  _id: string;
  schoolName: string;
  city: string;
  contractManagerName: string;
  phoneNumber: string;
  email: string;
  kindergartenStudents: number;
  primary1to4Students: number;
  primary5to6Students: number;
  intermediate1to2Students: number;
  intermediate3Students: number;
  secondaryStudents: number;
  hasComputerLab: boolean;
  hasInternet: boolean;
  commercialRegistration: { url: string };
  contractManagerId: { url: string };
  createdAt: string;
  updatedAt: string;
}

const Schools: React.FC = () => {
  const { logout } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    schoolName: '',
    city: '',
    contractManagerName: '',
    phoneNumber: '',
    email: ''
  });

  useEffect(() => {
    // Fetch schools from API
    const fetchSchools = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('الرجاء تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('https://evaaz-poll-hqzi.vercel.app/api/school/allschools', {
          headers: {
            'token': token
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Map the API response to the School[] structure
        type APISchool = {
          _id: string;
          schoolName: string;
          city: string;
          contractManagerName: string;
          phoneNumber: string;
          email: string;
          kindergartenStudents: number;
          primary1to4Students: number;
          primary5to6Students: number;
          intermediate1to2Students: number;
          intermediate3Students: number;
          secondaryStudents: number;
          hasComputerLab: string;
          hasInternet: string;
          commercialRegistration: { id: string; url: string };
          contractManagerId: { id: string; url: string };
          createdAt: string;
          updatedAt: string;
        };
        const schoolsData = (data['المدارس'] || []).map((item: APISchool) => ({
          _id: item._id,
          schoolName: item.schoolName,
          city: item.city,
          contractManagerName: item.contractManagerName,
          phoneNumber: item.phoneNumber,
          email: item.email,
          kindergartenStudents: item.kindergartenStudents,
          primary1to4Students: item.primary1to4Students,
          primary5to6Students: item.primary5to6Students,
          intermediate1to2Students: item.intermediate1to2Students,
          intermediate3Students: item.intermediate3Students,
          secondaryStudents: item.secondaryStudents,
          hasComputerLab: String(item.hasComputerLab).toLowerCase() === 'true',
          hasInternet: String(item.hasInternet).toLowerCase() === 'true',
          commercialRegistration: { url: item.commercialRegistration?.url || '#' },
          contractManagerId: { url: item.contractManagerId?.url || '#' },
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      } catch {
        setError('حدث خطأ أثناء تحميل المدارس');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one search field is filled
    const hasSearchCriteria = Object.values(searchForm).some(value => value.trim() !== '');
    if (!hasSearchCriteria) {
      setError('يرجى إدخال معيار بحث واحد على الأقل');
      return;
    }

    try {
      setSearchLoading(true);
      setError('');
      setSearchMode(true);
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple search implementation
      const filtered = schools.filter(school => {
        return (
          (!searchForm.schoolName || school.schoolName.toLowerCase().includes(searchForm.schoolName.toLowerCase())) &&
          (!searchForm.city || school.city.toLowerCase().includes(searchForm.city.toLowerCase())) &&
          (!searchForm.contractManagerName || school.contractManagerName.toLowerCase().includes(searchForm.contractManagerName.toLowerCase())) &&
          (!searchForm.phoneNumber || school.phoneNumber.includes(searchForm.phoneNumber)) &&
          (!searchForm.email || school.email.toLowerCase().includes(searchForm.email.toLowerCase()))
        );
      });
      
      setFilteredSchools(filtered);
      
      if (filtered.length === 0) {
        setError('لا يوجد نتائج مطابقة لمعايير البحث');
      }
    } catch {
      setError('حدث خطأ أثناء البحث');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setSearchForm({
      schoolName: '',
      city: '',
      contractManagerName: '',
      phoneNumber: '',
      email: ''
    });
    setSearchMode(false);
    setFilteredSchools(schools);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const getTotalStudents = (school: School) => {
    return school.kindergartenStudents + school.primary1to4Students + 
           school.primary5to6Students + school.intermediate1to2Students + 
           school.intermediate3Students + school.secondaryStudents;
  };

  const exportToExcel = () => {
    // Prepare data for export (flatten objects, convert booleans, etc.)
    const exportData = filteredSchools.map(school => ({
      'اسم المدرسة': school.schoolName,
      'المدينة': school.city,
      'مدير العقد': school.contractManagerName,
      'رقم الهاتف': school.phoneNumber,
      'البريد الإلكتروني': school.email,
      'عدد طلاب الروضة': school.kindergartenStudents,
      'عدد طلاب ابتدائي (1-4)': school.primary1to4Students,
      'عدد طلاب ابتدائي (5-6)': school.primary5to6Students,
      'عدد طلاب متوسط (1-2)': school.intermediate1to2Students,
      'عدد طلاب متوسط (3)': school.intermediate3Students,
      'عدد طلاب الثانوي': school.secondaryStudents,
      'معمل حاسب آلي': school.hasComputerLab ? 'نعم ✅' : 'لا ❌',
      'خدمة الإنترنت': school.hasInternet ? 'نعم ✅' : 'لا ❌',
      'تاريخ الإنشاء': new Date(school.createdAt).toLocaleDateString('ar-EG'),
      'تاريخ التحديث': new Date(school.updatedAt).toLocaleDateString('ar-EG'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schools');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'schools.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">جاري تحميل المدارس...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">نظام إدارة المدارس</h1>
                <p className="text-gray-600 text-sm sm:text-base">عرض وإدارة جميع المدارس المسجلة</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">البحث في المدارس</h2>
          </div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المدرسة
              </label>
              <input
                type="text"
                name="schoolName"
                value={searchForm.schoolName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
                placeholder="أدخل اسم المدرسة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة
              </label>
              <input
                type="text"
                name="city"
                value={searchForm.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
                placeholder="أدخل المدينة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم مدير العقد
              </label>
              <input
                type="text"
                name="contractManagerName"
                value={searchForm.contractManagerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
                placeholder="أدخل اسم مدير العقد"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={searchForm.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={searchForm.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-2 col-span-1 md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={searchLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {searchLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري البحث...</span>
                  </div>
                ) : (
                  'بحث'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                إعادة تعيين
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              {searchMode ? 'نتائج البحث' : 'جميع المدارس'}
            </h3>
            <button
              onClick={exportToExcel}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ml-2"
            >
              <Download className="w-4 h-4 ml-1" />
              تصدير Excel
            </button>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{filteredSchools.length} مدرسة</span>
          </div>
        </div>

        {/* Schools Grid */}
        {filteredSchools.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
              <School className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد مدارس
            </h3>
            <p className="text-gray-600">
              {searchMode ? 'لا توجد نتائج مطابقة لمعايير البحث' : 'لم يتم العثور على مدارس مسجلة'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school._id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2">{school.schoolName}</h4>
                      <div className="flex items-center space-x-2 space-x-reverse mt-2">
                        <MapPin className="w-5 h-5 text-yellow-300 drop-shadow" />
                        <span className="text-xl font-extrabold text-yellow-700 bg-yellow-100 rounded-full px-4 py-1 shadow-sm border border-yellow-200">{school.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-medium">
                        <Users className="w-4 h-4 inline ml-1" />
                        {getTotalStudents(school)} طالب
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Contact Info */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">معلومات التواصل</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{school.contractManagerName}</span>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{school.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{school.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Student Counts */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">توزيع الطلبة</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-blue-600">{school.kindergartenStudents}</div>
                        <div className="text-xs text-gray-600">روضة</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-green-600">{school.primary1to4Students}</div>
                        <div className="text-xs text-gray-600">ابتدائي (1-4)</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-yellow-600">{school.primary5to6Students}</div>
                        <div className="text-xs text-gray-600">ابتدائي (5-6)</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-purple-600">{school.intermediate1to2Students}</div>
                        <div className="text-xs text-gray-600">متوسط (1-2)</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-red-600">{school.intermediate3Students}</div>
                        <div className="text-xs text-gray-600">متوسط (3)</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-bold text-lg text-indigo-600">{school.secondaryStudents}</div>
                        <div className="text-xs text-gray-600">ثانوي</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Facilities */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">المرافق</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {school.hasComputerLab ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> : 
                          <XCircle className="w-5 h-5 text-red-500" />
                        }
                        <span className="text-sm text-gray-700">معمل حاسب آلي</span>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {school.hasInternet ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> : 
                          <XCircle className="w-5 h-5 text-red-500" />
                        }
                        <span className="text-sm text-gray-700">خدمة الإنترنت</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-3">المستندات</h5>
                    <div className="flex gap-2">
                      <a 
                        href={school.commercialRegistration?.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4 inline ml-1" />
                        السجل التجاري
                      </a>
                      <a 
                        href={school.contractManagerId?.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4 inline ml-1" />
                        هوية المدير
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>أنشئ: {new Date(school.createdAt).toLocaleDateString('ar-EG', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                    <span>محدث: {new Date(school.updatedAt).toLocaleDateString('ar-EG', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schools;