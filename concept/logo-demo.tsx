import { Logo, LOGO_SIZE, LOGO_VIEW, LOGO_VARIANT } from "@/shared/ui/logo";

export const LogoDemo = () => {
    return (
        <div className="min-h-screen bg-ctp-base p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <h1 className="text-4xl font-bold text-ctp-mauve mb-8">
                    Logo Component Demo
                </h1>

                {/* Size Variations */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">Size Variations</h2>
                    <div className="flex items-end gap-8 p-6 bg-ctp-surface0 rounded-lg">
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.S} />
                            <p className="text-sm text-ctp-subtext0">Small (24px)</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.M} />
                            <p className="text-sm text-ctp-subtext0">Medium (32px)</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.L} />
                            <p className="text-sm text-ctp-subtext0">Large (48px)</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.XL} />
                            <p className="text-sm text-ctp-subtext0">Extra Large (64px)</p>
                        </div>
                    </div>
                </section>

                {/* View Variations */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">View Variations (Color Schemes)</h2>
                    <div className="flex items-center gap-8 p-6 bg-ctp-surface0 rounded-lg">
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.L} view={LOGO_VIEW.PRIMARY} />
                            <p className="text-sm text-ctp-subtext0">Primary (Mauve)</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.L} view={LOGO_VIEW.SECONDARY} />
                            <p className="text-sm text-ctp-subtext0">Secondary (Green)</p>
                        </div>
                    </div>
                </section>

                {/* Variant Variations */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">Variant Variations (SVG Shapes)</h2>
                    <div className="flex items-center gap-8 p-6 bg-ctp-surface0 rounded-lg">
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.L} variant={LOGO_VARIANT.LOCK} />
                            <p className="text-sm text-ctp-subtext0">Lock (Premium)</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo size={LOGO_SIZE.L} variant={LOGO_VARIANT.SHIELD} />
                            <p className="text-sm text-ctp-subtext0">Shield (Minimalist)</p>
                        </div>
                    </div>
                </section>

                {/* With Text */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">With Text</h2>
                    <div className="space-y-4 p-6 bg-ctp-surface0 rounded-lg">
                        <Logo
                            size={LOGO_SIZE.L}
                            view={LOGO_VIEW.PRIMARY}
                            variant={LOGO_VARIANT.LOCK}
                            withText={true}
                        />
                        <Logo
                            size={LOGO_SIZE.L}
                            view={LOGO_VIEW.SECONDARY}
                            variant={LOGO_VARIANT.SHIELD}
                            withText={true}
                        />
                    </div>
                </section>

                {/* Animation Demo */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">
                        Animation (Hover Me!)
                    </h2>
                    <div className="flex items-center gap-8 p-6 bg-ctp-surface0 rounded-lg">
                        <div className="text-center space-y-2">
                            <Logo
                                size={LOGO_SIZE.L}
                                view={LOGO_VIEW.PRIMARY}
                                variant={LOGO_VARIANT.LOCK}
                                animate={true}
                            />
                            <p className="text-sm text-ctp-subtext0">Animated Lock</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo
                                size={LOGO_SIZE.L}
                                view={LOGO_VIEW.PRIMARY}
                                variant={LOGO_VARIANT.SHIELD}
                                animate={true}
                            />
                            <p className="text-sm text-ctp-subtext0">Animated Shield</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Logo
                                size={LOGO_SIZE.L}
                                view={LOGO_VIEW.PRIMARY}
                                variant={LOGO_VARIANT.LOCK}
                                animate={false}
                            />
                            <p className="text-sm text-ctp-subtext0">Static (no animation)</p>
                        </div>
                    </div>
                </section>

                {/* All Combinations */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">
                        All Combinations
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Lock - Primary */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-ctp-mauve">
                                Lock + Primary
                            </h3>
                            <Logo
                                size={LOGO_SIZE.XL}
                                view={LOGO_VIEW.PRIMARY}
                                variant={LOGO_VARIANT.LOCK}
                                withText={true}
                                animate={true}
                            />
                        </div>

                        {/* Lock - Secondary */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-ctp-green">
                                Lock + Secondary
                            </h3>
                            <Logo
                                size={LOGO_SIZE.XL}
                                view={LOGO_VIEW.SECONDARY}
                                variant={LOGO_VARIANT.LOCK}
                                withText={true}
                                animate={true}
                            />
                        </div>

                        {/* Shield - Primary */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-ctp-mauve">
                                Shield + Primary
                            </h3>
                            <Logo
                                size={LOGO_SIZE.XL}
                                view={LOGO_VIEW.PRIMARY}
                                variant={LOGO_VARIANT.SHIELD}
                                withText={true}
                                animate={true}
                            />
                        </div>

                        {/* Shield - Secondary */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-ctp-green">
                                Shield + Secondary
                            </h3>
                            <Logo
                                size={LOGO_SIZE.XL}
                                view={LOGO_VIEW.SECONDARY}
                                variant={LOGO_VARIANT.SHIELD}
                                withText={true}
                                animate={true}
                            />
                        </div>
                    </div>
                </section>

                {/* Usage Examples */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-ctp-text">Usage Examples</h2>
                    <div className="space-y-8">
                        {/* Header Example */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg">
                            <p className="text-sm text-ctp-subtext0 mb-4">Header Example</p>
                            <header className="flex items-center justify-between p-4 bg-ctp-mantle rounded">
                                <Logo
                                    size={LOGO_SIZE.M}
                                    view={LOGO_VIEW.PRIMARY}
                                    variant={LOGO_VARIANT.LOCK}
                                    withText={true}
                                />
                                <div className="text-ctp-text">Menu Items</div>
                            </header>
                        </div>

                        {/* Sidebar Example */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg">
                            <p className="text-sm text-ctp-subtext0 mb-4">Sidebar Example (Compact)</p>
                            <aside className="w-64 p-4 bg-ctp-mantle rounded space-y-4">
                                <Logo
                                    size={LOGO_SIZE.M}
                                    view={LOGO_VIEW.PRIMARY}
                                    variant={LOGO_VARIANT.LOCK}
                                    withText={false}
                                />
                                <div className="space-y-2 text-ctp-text text-sm">
                                    <div>Dashboard</div>
                                    <div>Settings</div>
                                    <div>Profile</div>
                                </div>
                            </aside>
                        </div>

                        {/* Login/Splash Example */}
                        <div className="p-6 bg-ctp-surface0 rounded-lg">
                            <p className="text-sm text-ctp-subtext0 mb-4">Login/Splash Screen Example</p>
                            <div className="flex flex-col items-center justify-center p-12 bg-ctp-mantle rounded">
                                <Logo
                                    size={LOGO_SIZE.XL}
                                    view={LOGO_VIEW.PRIMARY}
                                    variant={LOGO_VARIANT.LOCK}
                                    withText={true}
                                    animate={true}
                                />
                                <p className="mt-6 text-ctp-subtext0">Welcome back!</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
