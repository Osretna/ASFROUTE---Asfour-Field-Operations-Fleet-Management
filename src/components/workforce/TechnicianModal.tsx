import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Technician, InstallationTeam, SkillLevel, BranchId } from '../../types';
import { Users, X, Save, Award, Sparkles } from 'lucide-react';
import { BRANCHES } from '../../data/mockData';

interface TechnicianModalProps {
  techToEdit?: Technician | null;
  mode?: 'technician' | 'team';
  onClose: () => void;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({ techToEdit, mode = 'technician', onClose }) => {
  const { language, addTechnician, updateTechnician, addTeam, technicians, vehicles } = useApp();
  const isAr = language === 'ar';

  const isEditing = !!techToEdit;

  // Tech state
  const [techData, setTechData] = useState<Partial<Technician>>(() => {
    if (techToEdit) return { ...techToEdit };
    return {
      id: `TECH-00${Math.floor(6 + Math.random() * 20)}`,
      nameAr: 'المهندس ياسر المغربي',
      nameEn: 'Eng. Yasser El-Maghraby',
      roleAr: 'مهندس تركيبات القاعات الكبرى والثريات المعلقة',
      roleEn: 'Grand Atrium & Suspended Chandelier Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      branchId: 'new_cairo',
      status: 'available',
      rating: 4.96,
      completedJobsCount: 140,
      phoneNumber: '+20 101 992 4810',
      certifications: [
        {
          skillId: 'SK-01',
          skillNameAr: 'ماستر تركيب النجف الكريستال الأسطوري (فئة 5)',
          skillNameEn: 'Master Tier-5 Grand Crystal Assembly',
          level: 5,
          issuedDate: '2023-01-10',
          expiryDate: '2028-01-10',
          isHighAltitudeCertified: true,
          maxWorkHeightMeters: 20
        }
      ]
    };
  });

  // Team state
  const [teamData, setTeamData] = useState<Partial<InstallationTeam>>({
    id: `TEAM-GOLD-0${Math.floor(3 + Math.random() * 10)}`,
    nameAr: 'فريق النخبة الملكي (قصور العاصمة)',
    nameEn: 'Royal Elite Team (Capital Palaces)',
    leadTechnicianId: technicians[0]?.id || 'TECH-001',
    memberIds: [technicians[0]?.id || 'TECH-001'],
    assignedVehicleId: vehicles[0]?.id || 'TRK-101',
    branchId: 'new_cairo',
    compositeSkillRating: 4.95,
    maxHeightAuthorizedM: 24,
    status: 'ready'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'technician') {
      if (isEditing && techToEdit) {
        updateTechnician(techData as Technician);
      } else {
        addTechnician(techData as Technician);
      }
    } else {
      addTeam(teamData as InstallationTeam);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'technician'
                  ? (isEditing ? (isAr ? 'تعديل بيانات الفني' : 'Edit Technician') : (isAr ? 'إضافة فني / مهندس جديد' : 'Register New Technician'))
                  : (isAr ? 'تكوين فريق تركيب معتمد' : 'Assemble Installation Team')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {mode === 'technician' ? techData.id : teamData.id}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-1">
          {mode === 'technician' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'الاسم بالكامل (عربي):' : 'Full Name (AR):'}</label>
                  <input
                    type="text"
                    required
                    value={techData.nameAr}
                    onChange={(e) => setTechData({ ...techData, nameAr: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'الاسم بالكامل (إنجليزي):' : 'Full Name (EN):'}</label>
                  <input
                    type="text"
                    required
                    value={techData.nameEn}
                    onChange={(e) => setTechData({ ...techData, nameEn: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'المسمى الوظيفي والدور التخصصي:' : 'Role / Specialty:'}</label>
                <input
                  type="text"
                  required
                  value={techData.roleAr}
                  onChange={(e) => setTechData({ ...techData, roleAr: e.target.value, roleEn: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'رقم الهاتف الميداني:' : 'Phone Number:'}</label>
                  <input
                    type="text"
                    required
                    value={techData.phoneNumber}
                    onChange={(e) => setTechData({ ...techData, phoneNumber: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'الفرع التابع له:' : 'Branch:'}</label>
                  <select
                    value={techData.branchId}
                    onChange={(e) => setTechData({ ...techData, branchId: e.target.value as BranchId })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                  >
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-[#DFBA6B] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{isAr ? 'الاعتماد وترخيص الارتفاعات:' : 'Certification & Max Altitude:'}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400">{isAr ? 'مستوى الكفاءة (1-5):' : 'Skill Level:'}</label>
                    <select
                      value={techData.certifications?.[0]?.level || 5}
                      onChange={(e) => {
                        const lvl = parseInt(e.target.value) as SkillLevel;
                        setTechData({
                          ...techData,
                          certifications: [{
                            ...techData.certifications![0],
                            level: lvl
                          }]
                        });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none"
                    >
                      <option value="5">Level 5 (Master Artisan)</option>
                      <option value="4">Level 4 (Senior Specialist)</option>
                      <option value="3">Level 3 (Certified Tech)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400">{isAr ? 'أقصى ارتفاع عمل (م):' : 'Max Work Altitude (m):'}</label>
                    <input
                      type="number"
                      value={techData.certifications?.[0]?.maxWorkHeightMeters || 20}
                      onChange={(e) => {
                        const m = parseInt(e.target.value) || 12;
                        setTechData({
                          ...techData,
                          certifications: [{
                            ...techData.certifications![0],
                            maxWorkHeightMeters: m
                          }]
                        });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Team Assembly Form
            <>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم الفريق (عربي):' : 'Team Name (AR):'}</label>
                <input
                  type="text"
                  required
                  value={teamData.nameAr}
                  onChange={(e) => setTeamData({ ...teamData, nameAr: e.target.value, nameEn: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'قائد الفريق (Lead Tech):' : 'Lead Technician:'}</label>
                  <select
                    value={teamData.leadTechnicianId}
                    onChange={(e) => setTeamData({ ...teamData, leadTechnicianId: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{isAr ? t.nameAr : t.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'الشاحنة المخصصة للفريق:' : 'Assigned Truck:'}</label>
                  <select
                    value={teamData.assignedVehicleId}
                    onChange={(e) => setTeamData({ ...teamData, assignedVehicleId: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} · {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'أقصى ارتفاع عمل مسموح للفريق (م):' : 'Max Authorized Altitude (m):'}</label>
                <input
                  type="number"
                  required
                  value={teamData.maxHeightAuthorizedM}
                  onChange={(e) => setTeamData({ ...teamData, maxHeightAuthorizedM: parseInt(e.target.value) || 15 })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center gap-1.5 shadow-lg shadow-[#C5A45B]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'اعتماد الإضافة' : 'Save & Register')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
