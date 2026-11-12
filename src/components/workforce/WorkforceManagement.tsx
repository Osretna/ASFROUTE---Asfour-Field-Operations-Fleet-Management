import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Technician, InstallationTeam } from '../../types';
import { 
  Users, 
  Award, 
  ShieldCheck, 
  Star, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

export const WorkforceManagement: React.FC = () => {
  const { language, technicians, teams } = useApp();
  const isAr = language === 'ar';

  const [selectedTech, setSelectedTech] = useState<Technician>(technicians[0]);
  const [activeSubTab, setActiveSubTab] = useState<'technicians' | 'matrix' | 'teams'>('technicians');

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'فِرق التركيب المعتمدة ومصفوفة المهارات' : 'Installation Workforce & Graded Skill Matrix'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'اعتمادات معهد عصفور للكريستال: رص وتثبيت الثريات الملكية، السقالات الشاهقة، وتوصيلات التحكم الذكي DMX' 
              : 'Asfour Crystal Institute Certifications: Master Assembly, Scaffolding >18m, and DMX architectural controls'}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('technicians')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'technicians' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'سجل الفنيين والمهندسين' : 'Technicians Roster'}
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'matrix' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'مصفوفة الكفاءات (Skill Matrix)' : 'Skill Matrix'}
          </button>
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'teams' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الفِرق المتكاملة (Teams)' : 'Installation Teams'}
          </button>
        </div>
      </div>

      {/* Tab 1: Technicians Roster & Detailed Card */}
      {activeSubTab === 'technicians' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Techs List */}
          <div className="lg:col-span-2 overflow-y-auto flex flex-col gap-3 pe-1">
            {technicians.map((tech) => {
              const isSelected = selectedTech.id === tech.id;

              return (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTech(tech)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-slate-900 border-[#C5A45B] shadow-lg shadow-[#C5A45B]/10' 
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={tech.avatar}
                      alt={tech.nameEn}
                      className="w-12 h-12 rounded-xl object-cover border border-[#C5A45B]/40 shrink-0 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {isAr ? tech.nameAr : tech.nameEn}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[#DFBA6B] border border-[#C5A45B]/30">
                          {tech.id}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {isAr ? tech.roleAr : tech.roleEn}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          {tech.rating}
                        </span>
                        <span>·</span>
                        <span>{tech.completedJobsCount} {isAr ? 'مهمة منجزة' : 'Jobs Done'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                      tech.status === 'on_site' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                        : tech.status === 'en_route'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {tech.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {tech.phoneNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Technician Certification Profile */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <img
                  src={selectedTech.avatar}
                  alt={selectedTech.nameEn}
                  className="w-14 h-14 rounded-xl object-cover border border-[#C5A45B]/50 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? selectedTech.nameAr : selectedTech.nameEn}
                  </h3>
                  <span className="text-xs text-[#DFBA6B] block">
                    {isAr ? selectedTech.roleAr : selectedTech.roleEn}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    {selectedTech.phoneNumber}
                  </span>
                </div>
              </div>

              {/* Badges / Certifications */}
              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#C5A45B]" />
                    <span>{isAr ? 'الشهادات والاعتمادات الميدانية' : 'Active Certifications'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                </div>

                <div className="flex flex-col gap-2">
                  {selectedTech.certifications.map(cert => (
                    <div key={cert.skillId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          {isAr ? cert.skillNameAr : cert.skillNameEn}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#DFBA6B]">
                          Level {cert.level}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{isAr ? 'صالحة حتى:' : 'Expires:'} {cert.expiryDate}</span>
                        <span className="text-emerald-400">
                          {cert.isHighAltitudeCertified ? `Scaffold: Up to ${cert.maxWorkHeightMeters}m` : 'Ground Level'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'تقييم العملاء' : 'Customer Rating'}</span>
                  <span className="text-base font-bold font-mono text-amber-400">★ {selectedTech.rating}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'ثريات مُركبة' : 'Installed'}</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{selectedTech.completedJobsCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'الترخيص الطبي والسلامة:' : 'Safety Fitness:'}</span>
              <span className="text-emerald-400 font-mono font-bold">CLEARED FOR HIGH ALTITUDE</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Graded Skill Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'مصفوفة مطابقة المهارات لتعيينات الثريات' : 'Skill-to-Job Qualification Matrix'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr 
                  ? 'يمنع النظام تعيين أي فني لثريا ملكية فائقة الهشاشة ما لم يكن حاصلاً على المستوى 4 أو 5' 
                  : 'System automatically blocks assigning technicians below Level 4 to palatial & ultra-delicate masterpieces'}
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-start">
                <th className="py-3 px-4 font-semibold text-start">{isAr ? 'الفني / المهندس' : 'Technician'}</th>
                <th className="py-3 px-4 font-semibold text-center">{isAr ? 'تجميع كريستال عصفور (L1-L5)' : 'Asfour Crystal Assembly'}</th>
                <th className="py-3 px-4 font-semibold text-center">{isAr ? 'سقالات وأوناش (>15م)' : 'Rigging & Scaffolding'}</th>
                <th className="py-3 px-4 font-semibold text-center">{isAr ? 'اختبار مراسي الأسقف' : 'Anchor Pull Testing'}</th>
                <th className="py-3 px-4 font-semibold text-center">{isAr ? 'أنظمة الإضاءة الذكية DMX' : 'DMX & Smart Dimming'}</th>
                <th className="py-3 px-4 font-semibold text-center">{isAr ? 'حالة الاعتماد' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {technicians.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{isAr ? t.nameAr : t.nameEn}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.id}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#C5A45B]/20 text-[#DFBA6B] font-bold">L5 Master</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">L5 (28m)</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Certified</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">L4 DMX</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      AUTHORIZED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Teams Roster */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 overflow-y-auto">
          {teams.map(team => (
            <div key={team.id} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{isAr ? team.nameAr : team.nameEn}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{team.id}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-400">★ {team.compositeSkillRating}</span>
                </div>

                <div className="my-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'الشاحنة المخصصة:' : 'Assigned Truck:'}</span>
                    <span className="font-mono text-slate-200">{team.assignedVehicleId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'أقصى ارتفاع عمل معتمد:' : 'Max Certified Altitude:'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{team.maxHeightAuthorizedM} meters</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-semibold mb-1">
                  {isAr ? 'أعضاء الفريق الفني:' : 'Team Composition:'}
                </div>
                <div className="flex flex-col gap-1.5">
                  {team.memberIds.map(memId => {
                    const tech = technicians.find(t => t.id === memId);
                    if (!tech) return null;
                    return (
                      <div key={tech.id} className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{isAr ? tech.nameAr : tech.nameEn}</span>
                        <span className="text-[10px] text-[#DFBA6B]">{tech.roleAr.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'الحالة الميدانية:' : 'Status:'}</span>
                <span className="text-emerald-400 font-semibold uppercase">{team.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
