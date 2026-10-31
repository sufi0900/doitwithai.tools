import React from 'react';
import { getFileUrl, renderPreviewContent } from "@/app/free-ai-resources/resourceUtils";
import Link from 'next/link';
// import { Card } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Global modal state tracking
let activeModalId = null;

export const closeAllModals = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('closeAllResourceModals', { detail: { closeAll: true } }));
    }
    activeModalId = null;
};

export const openModalById = (id) => {
    closeAllModals();
    activeModalId = id;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openResourceModal', { detail: { id } }));
    }
};

const ResourceCard = ({ resource, wrapperClassName = "" }) => {
    const handleResourceAccess = () => {
        if (resource.resourceFormat === 'text' && resource.promptContent) {
            openModalById(resource._id);
            return;
        }

        if (resource.resourceFormat === 'aitool' && resource.resourceLink) {
            window.open(resource.resourceLink, '_blank');
            return;
        }

        if (resource.resourceLinkType === 'direct' && resource.resourceFile) {
            const fileUrl = getFileUrl(resource.resourceFile);
            const fileName = resource.resourceFile.originalFilename || `${resource.title.replace(/\s+/g, '-').toLowerCase()}`;
            if (!fileUrl) {
                console.error('Could not determine file URL for', resource.title);
                return;
            }
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = fileName;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else if (resource.resourceLink) {
            window.open(resource.resourceLink, '_blank');
        }
    };

    // Enhanced resource type configurations with brand colors
    const resourceTypeConfig = {
        text: { gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
        image: { gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
        video: { gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
        document: { gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
        aitool: { gradient: 'from-blue-600 to-blue-700', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
        default: { gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30', iconColor: 'text-blue-600', accent: 'blue', glowColor: 'rgba(37,99,235,0.4)' },
    };
    const config = resourceTypeConfig[resource.resourceFormat] || resourceTypeConfig.default;

    // Enhanced prompt preview with terminal styling
    const renderPromptCard = () => {
        if (!resource.promptContent || !Array.isArray(resource.promptContent) || resource.promptContent.length === 0) {
            return (
                <div className={`bg-gradient-to-br ${config.bgGradient} p-6 h-full rounded-lg flex flex-col items-center justify-center`}>
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI Prompts Ready</p>
                    </div>
                </div>
            );
        }
        return (
            <div className={`bg-gradient-to-br ${config.bgGradient} p-4 h-full rounded-lg flex flex-col overflow-hidden relative border border-white/20`}>
                {/* Resource Pattern Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12" />
                    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`, backgroundSize: '20px 20px', }} />
                </div>
                {/* Terminal Header */}
                <div className="relative z-10 h-8 bg-gray-900 dark:bg-black flex items-center px-3 border-b border-white/10 mb-3 rounded-t-lg">
                    <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-400 ml-auto flex items-center gap-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {resource.promptContent.length} prompts
                    </div>
                </div>
                {/* Command Line */}
                <div className="relative z-10 font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
                    <span className="text-emerald-500">➜</span>
                    <span className="text-blue-400 ml-1">ai-prompts</span>
                    <span className="text-gray-500 ml-1">cat {resource.title.toLowerCase().replace(/\s+/g, '-')}.txt</span>
                </div>
                {/* Prompt Content Preview */}
                <div className="relative z-10 font-mono text-xs text-gray-700 dark:text-gray-300 flex-1 overflow-y-auto space-y-2 pr-1">
                    {resource.promptContent.slice(0, 2).map((prompt, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-blue-300 dark:border-blue-600 bg-white/20 dark:bg-black/10 rounded-r-lg p-2">
                            <div className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-blue-400"></div>
                            <div className={`${config.iconColor} font-semibold text-xs mb-1 flex items-center gap-1`}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>
                                Prompt #{idx + 1}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">{prompt.promptText?.length > 80 ? `${prompt.promptText.slice(0, 80)}...` : prompt.promptText}</div>
                        </div>
                    ))}
                    {resource.promptContent.length > 2 && (
                        <div className={`text-center ${config.iconColor} text-xs font-semibold bg-white/20 dark:bg-black/10 rounded-lg p-2`}>
                            +{resource.promptContent.length - 2} more AI prompts available
                        </div>
                    )}
                </div>
                {/* Prompt Count Badge */}
                <div className="absolute top-2 right-2 z-20">
                    <div className={`bg-gradient-to-r ${config.gradient} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {resource.promptContent.length}
                    </div>
                </div>
            </div>
        );
    };

    // Resource format icon mapping with enhanced designs
    const getResourceIcon = (format) => {
        const icons = {
            text: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
            image: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
            video: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
            document: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
            aitool: (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.11 1.11" /></svg>),
        };
        return icons[format] || icons.document;
    };

    // Get appropriate action text based on resource type
    const getActionText = () => {
        if (resource.resourceFormat === 'aitool') return 'Try AI Tool';
        if (resource.resourceFormat === 'text') return 'View AI Prompts';
        if (resource.resourceLinkType === 'external') return 'Access Resource';
        return 'Download Resource';
    };

    const getActionIcon = () => {
        if (resource.resourceFormat === 'aitool') {
            return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.11 1.11" /></svg>);
        }
        if (resource.resourceFormat === 'text') {
            return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
        }
        if (resource.resourceLinkType === 'external') {
            return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>);
        }
        return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
    };

    return (
        <div className={`${wrapperClassName} group w-full`}>
            <div className="h-[600px] sm:h-[580px] md:h-[600px] lg:h-[620px] xl:h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-[1.02] flex flex-col relative border border-gray-100 dark:border-gray-700">
                {/* Enhanced Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-out z-10" style={{ maskImage: 'linear-gradient(90deg,transparent,black,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,black,transparent)', }} />
                {/* Resource Preview Section */}
                <div className="relative h-[280px] sm:h-[260px] md:h-[280px] lg:h-[300px] xl:h-[280px] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    {resource.resourceFormat === 'text' ? (
                        <div className="h-full relative">{renderPromptCard()}</div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10"></div>
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-500">{renderPreviewContent(resource)}</div>
                        </>
                    )}
                    {/* Resource Type Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className={`bg-gradient-to-r ${config.gradient} text-white px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg backdrop-blur-sm border border-white/20`}>
                            {getResourceIcon(resource.resourceFormat)}
                            <span>{resource.resourceFormat === 'aitool' ? 'AI Tool' : resource.resourceFormat}</span>
                        </div>
                    </div>
                    {/* AI Tool Specific Badges */}
                    {resource.resourceFormat === 'aitool' && resource.aiToolDetails && (
                        <>
                            {/* Pricing Badge (Enhanced) */}
                            {resource.aiToolDetails.pricingModel && (
                                <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-medium uppercase text-white shadow-sm transition-colors ${resource.aiToolDetails.pricingModel === 'free' ? 'bg-green-600' : resource.aiToolDetails.pricingModel === 'freemium' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                                    {resource.aiToolDetails.pricingModel.charAt(0).toUpperCase() + resource.aiToolDetails.pricingModel.slice(1)}
                                </div>
                            )}
                            {/* Rating Badge (Enhanced) */}
                            {resource.aiToolDetails.rating && (
                                <div className="absolute top-12 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-500 text-white flex items-center gap-1 shadow-sm">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09.123-6.545L.489 6.91l6.572-.955L10 0l2.939.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                    {resource.aiToolDetails.rating}
                                </div>
                            )}
                        </>
                    )}
                    {/* Free Badge (Only for non-AI tool resources and if not a paid AI tool) */}
                    {resource.resourceFormat !== 'aitool' && (
                        <div className="absolute top-4 right-4 z-20">
                            <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>FREE</div>
                        </div>
                    )}
                    {/* Resource Quality Indicator */}
                    <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Ready to Use</span>
                        </div>
                    </div>
                </div>
                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 min-h-0 relative z-10">
                    {/* Title with Resource Context */}
                    <div className="flex-shrink-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors duration-300 min-h-[3.5rem] mb-3">{resource.title}</h3>
                    </div>
                    {/* Description */}
                    <div className="flex-1 min-h-0 mb-4 relative z-10">
                        {resource.overview && (<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">{resource.overview}</p>)}
                        {/* Meta info (tags, date) */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {resource.tags?.map((tag, idx) => (
                                <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Enhanced Meta Information */}
                    <div className="flex items-center justify-between mt-8 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 relative z-10">
                        {resource.publishedAt && (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/50 transition-colors duration-300">
                                    <svg className="w-3 h-3 text-[#10b981] dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(resource.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                    {/* Enhanced Action Buttons */}
                    <div className="mt-auto pt-4 space-y-3 flex-shrink-0 relative z-10">
                        {/* Quick Preview Button */}
                        <button onClick={() => openModalById(resource._id)} className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 hover:scale-105 group/preview">
                            <svg className="w-4 h-4 group-hover/preview:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Quick Preview
                        </button>
                        {/* Primary Action Button */}
                        <Link
                         href={resource.resourceFormat === 'aitool' && resource.aiToolDetails?.toolUrl
      ? resource.aiToolDetails.toolUrl // <-- Corrected: Use aiToolDetails.toolUrl
      : resource.resourceLink || '#'} // <-- Use resourceLink for other types, or a fallback '#'
    target="_blank" // <-- Added: Always open external links in a new tab
    rel="noopener noreferrer" // <-- Added: Best practice for security
    onClick={
        // Only run the handler for non-AI tools that need specific handling (e.g., file downloads)
        resource.resourceFormat !== 'aitool' ? handleResourceAccess : undefined
    }
                         className={`group/button relative w-full bg-gradient-to-r ${config.gradient} text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden`} style={{ boxShadow: `0 4px 15px ${config.glowColor}`, }} aria-label={resource.resourceFormat === 'text' ? `View AI prompts for ${resource.title}` : resource.resourceFormat === 'aitool' ? `Try AI Tool: ${resource.title}` : resource.resourceLinkType === 'external' ? `Access resource ${resource.title}` : `Download ${resource.title} for free`}>
                            {/* Enhanced Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
                            {/* Button Content */}
                            <div className="relative z-10 flex items-center gap-2">
                                <div className="transform group-hover/button:scale-110 group-hover/button:rotate-3 transition-all duration-300">
                                    {getActionIcon()}
                                </div>
                                <span className="font-bold">{getActionText()}</span>
                                <ArrowForward className="relative z-10 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:scale-110" sx={{ fontSize: 18 }} />
                            </div>
                            {/* Enhanced Glow Effect */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/button:opacity-40 transition-opacity duration-300 blur-sm" style={{ background: `linear-gradient(135deg,${config.glowColor},${config.glowColor})`, }} />
                        </Link>
                    </div>
                </div>
                {/* Enhanced Corner Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${config.gradient} opacity-10 rounded-bl-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500`} />
                {/* Resource Quality Seal */}
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-transparent rounded-tr-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
            </div>
        </div>
    );
};

export default ResourceCard;